import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Use tagged template syntax for queries without parameters
        const result = await sql`SELECT NOW() as current_time`;
        return NextResponse.json({
            success: true,
            message: 'Database connected successfully!',
            data: result
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
