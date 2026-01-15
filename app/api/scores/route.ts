import { kv } from '@vercel/kv'; // Changed this line
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch top 10 scores
    const scores = await kv.zrange('trench_sniper_leaderboard', 0, 9, { rev: true, withScores: true });
    return NextResponse.json(scores);
  } catch (error) {
    console.error("KV GET Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { username, score } = await req.json();
    if (username && score !== undefined) {
      await kv.zadd('trench_sniper_leaderboard', { score, member: username });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("KV POST Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}