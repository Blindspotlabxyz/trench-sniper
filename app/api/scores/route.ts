import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const scores = await kv.zrange('trench_sniper_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });
    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, score } = await request.json();
    if (!username || score === undefined) throw new Error('Invalid data');
    
    await kv.zadd('trench_sniper_leaderboard', { score, member: username });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}