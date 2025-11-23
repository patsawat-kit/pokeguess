import { NextRequest, NextResponse } from 'next/server';
import { createMocks } from 'node-mocks-http';

// Mock dependencies BEFORE importing routes
jest.mock('@/lib/db', () => ({
    sql: jest.fn(),
    queryOne: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
    sendPasswordResetEmail: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
    genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Import routes AFTER mocking
import { POST as forgotPasswordHandler } from '@/src/app/api/auth/forgot-password/route';
import { POST as resetPasswordHandler } from '@/src/app/api/auth/reset-password/route';
import { sql, queryOne } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

describe('Auth API Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Forgot Password Flow', () => {
        it('should send email if user exists', async () => {
            // Mock DB finding a user
            (sql as jest.Mock).mockResolvedValueOnce([{ id: 'user-123' }]);
            // Mock DB inserting token
            (sql as jest.Mock).mockResolvedValueOnce([]);

            const req = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
            });

            const res = await forgotPasswordHandler(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
        });

        it('should return success but NOT send email if user does not exist', async () => {
            // Mock DB finding NO user
            (sql as jest.Mock).mockResolvedValueOnce([]);

            const req = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: 'nonexistent@example.com' }),
            });

            const res = await forgotPasswordHandler(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true); // Security: don't reveal existence
            expect(sendPasswordResetEmail).not.toHaveBeenCalled();
        });
    });

    describe('Reset Password Flow', () => {
        it('should update password with valid token', async () => {
            // Mock DB finding valid token
            (sql as jest.Mock).mockResolvedValueOnce([{
                email: 'test@example.com',
                expires_at: new Date(Date.now() + 3600000) // 1 hour future
            }]);

            // Mock DB updating password
            (sql as jest.Mock).mockResolvedValueOnce([]);
            // Mock DB deleting token
            (sql as jest.Mock).mockResolvedValueOnce([]);

            const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token: 'valid-token', newPassword: 'new-password' }),
            });

            const res = await resetPasswordHandler(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should reject invalid token', async () => {
            // Mock DB finding NO token
            (sql as jest.Mock).mockResolvedValueOnce([]);

            const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token: 'invalid-token', newPassword: 'new-password' }),
            });

            const res = await resetPasswordHandler(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toMatch(/Invalid or expired token/);
        });

        it('should reject expired token', async () => {
            // Mock DB finding EXPIRED token
            (sql as jest.Mock).mockResolvedValueOnce([{
                email: 'test@example.com',
                expires_at: new Date(Date.now() - 3600000) // 1 hour past
            }]);
            // Mock DB deleting expired token
            (sql as jest.Mock).mockResolvedValueOnce([]);

            const req = new NextRequest('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token: 'expired-token', newPassword: 'new-password' }),
            });

            const res = await resetPasswordHandler(req);
            const data = await res.json();

            expect(res.status).toBe(400);
            expect(data.error).toMatch(/Token has expired/);
        });
    });
});
