import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Attempt a lightweight database query to verify connectivity
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ready',
      database: 'connected',
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0', // In a real app, this might come from package.json
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Readiness probe failed:', error);
    return NextResponse.json({
      status: 'unavailable',
      database: 'disconnected',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
