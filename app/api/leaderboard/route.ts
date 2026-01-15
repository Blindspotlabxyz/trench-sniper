import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Uses Vercel KV to get the top 100 scores
    const topScores = await kv.zrange('leaderboard', 0, 99, {
      rev: true,
      withScores: true,
    });

    const formatted = [];
    for (let i = 0; i < topScores.length; i += 2) {
      formatted.push({
        username: topScores[i] as string,
        score: topScores[i + 1] as number,
      });
    }
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json([], { status: 200 }); // Return empty array instead of crashing
  }
}

export async function POST(req: Request) {
  try {
    const { username, score } = await req.json();
    if (!username || typeof score !== 'number') return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    await kv.zadd('leaderboard', { score: score, member: username });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
