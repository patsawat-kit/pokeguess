import { createMocks } from 'node-mocks-http';
import { POST as startTrivia } from '@/src/app/api/trivia/start/route';
import { POST as guessTrivia } from '@/src/app/api/trivia/guess/route';

// Mock DB to prevent actual writes
jest.mock('@/src/lib/db', () => ({
    queryOne: jest.fn(),
    upsertGameStats: jest.fn(),
}));

// Mock Auth
jest.mock('@/src/lib/auth', () => ({
    getUserFromCookie: jest.fn().mockResolvedValue('test-user-id'),
}));

// Mock jose to avoid ESM issues
jest.mock('jose', () => ({
    SignJWT: class {
        constructor(payload: any) { this.payload = payload; }
        setProtectedHeader() { return this; }
        setIssuedAt() { return this; }
        setExpirationTime() { return this; }
        async sign() { return JSON.stringify(this.payload); } // Return payload as token for easy testing
    },
    jwtVerify: async (token: string) => {
        if (token === 'INVALID_TOKEN') throw new Error('Invalid token');
        return { payload: JSON.parse(token) };
    }
}));

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'test-secret');

// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
            id: 25,
            name: 'pikachu',
            sprites: { other: { 'official-artwork': { front_default: 'url' } } },
            flavor_text_entries: [
                {
                    flavor_text: "When Pikachu meets a friend, it touches tails.",
                    language: { name: 'en', url: '' },
                    version: { name: 'red', url: '' }
                }
            ]
        }),
    })
) as jest.Mock;

describe('Trivia API Security Tests', () => {

    // Test 1: No Data Leakage
    test('POST /api/trivia/start should NOT leak Pokemon name', async () => {
        // Mock Request object compatible with NextRequest
        const req = {
            json: async () => ({ mode: 'trivia' })
        } as any;

        const response = await startTrivia(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.gameToken).toBeDefined();
        expect(data.flavorText).toBeDefined();

        // Verify the flavor text is sanitized (contains underscores)
        // "When Pikachu meets..." -> "When _______ meets..."
        expect(data.flavorText).toContain('_______');
        expect(data.flavorText).not.toContain('Pikachu');

        // CRITICAL: Ensure the response body does NOT contain the Pokemon name or ID
        const keys = Object.keys(data);
        expect(keys).not.toContain('pokemonName');
        expect(keys).not.toContain('pokemonId');
        expect(keys).not.toContain('answer');
    });

    // Test 2: Unauthorized Access / Tampered Token
    test('POST /api/trivia/guess should reject invalid tokens', async () => {
        // Create a fake/tampered token using our mock
        const fakeToken = 'INVALID_TOKEN';

        const req = {
            json: async () => ({
                guess: 'pikachu',
                gameToken: fakeToken,
            })
        } as any;

        const response = await guessTrivia(req);
        const data = await response.json();

        // Should return 401 Unauthorized
        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.error).toMatch(/Invalid or expired game token/i);
    });
});
