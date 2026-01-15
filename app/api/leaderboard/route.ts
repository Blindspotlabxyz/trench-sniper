import { NextResponse } from 'next/server';
import { kvClient, LEADERBOARD_KEY, MAX_LEADERBOARD_SIZE } from '@/lib/kv';

export async function GET() {
  try {
    const leaderboard = await kvClient.zrange(LEADERBOARD_KEY, 0, MAX_LEADERBOARD_SIZE - 1, {
      rev: true,
      withScores: true,
    });
    // This returns the data to your game component
    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, score } = await request.json();
    // Saves the score to Vercel KV
    await kvClient.zadd(LEADERBOARD_KEY, { score, member: username });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}