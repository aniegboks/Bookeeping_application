import { NextRequest, NextResponse } from 'next/server';
import { academicSessionsApi } from '@/lib/academic_session';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await academicSessionsApi.getAll(token);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Academic sessions fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = await academicSessionsApi.create(body, token);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Academic session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}