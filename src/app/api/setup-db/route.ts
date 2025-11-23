import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);`;

        return NextResponse.json({ success: true, message: 'Database schema updated successfully' });
    } catch (error) {
        console.error('Schema update error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
