import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Correctly fetch the top 10 from Vercel KV
    const scores = await kv.zrange('trench_sniper_leaderboard', 0, 9, { rev: true, withScores: true });
    return NextResponse.json(scores);
  } catch (error) {
    console.error("KV Fetch Error:", error);
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
    return NextResponse.json({ success: false }, { status: 500 });
  }
}