import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        // FIX: Use await sql`...` directly instead of queryOne(sql`...`)
        // sql`...` returns a Promise<Row[]>, so we take the first item
        const users = await sql`SELECT id FROM users WHERE email = ${email} `;
        const user = users[0];

        if (!user) {
            // For security, don't reveal if email exists or not
            return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate secure token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to DB
        await sql`
            INSERT INTO password_resets(email, token, expires_at)
VALUES(${email}, ${token}, ${expiresAt})
    `;

        // SEND EMAIL
        await sendPasswordResetEmail(email, token);

        return NextResponse.json({
            success: true,
            message: 'If an account exists, a reset link has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
