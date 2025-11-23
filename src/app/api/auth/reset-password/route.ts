import { NextRequest, NextResponse } from 'next/server';
import { queryOne, sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Token and new password are required' },
                { status: 400 }
            );
        }

        // Verify token
        // FIX: Use await sql`...` directly
        const resetRecords = await sql`SELECT email, expires_at FROM password_resets WHERE token = ${token}`;
        const resetRecord = resetRecords[0];

        if (!resetRecord) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired token' },
                { status: 400 }
            );
        }

        // Check expiration
        if (new Date() > new Date(resetRecord.expires_at)) {
            // Clean up expired token
            await sql`DELETE FROM password_resets WHERE token = ${token}`;
            return NextResponse.json(
                { success: false, error: 'Token has expired' },
                { status: 400 }
            );
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password
        await sql`
            UPDATE users 
            SET password_hash = ${hashedPassword} 
            WHERE email = ${resetRecord.email}
        `;

        // Delete used token
        await sql`DELETE FROM password_resets WHERE token = ${token}`;

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
