import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// This automatically connects using the 'Cyan Mountain' credentials on Vercel
const redis = Redis.fromEnv();

export async function GET() {
  try {
    const scores = await redis.zrange('trench_sniper_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });
    return NextResponse.json(scores || []);
  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { username, score } = await req.json();
    if (username && score !== undefined) {
      await redis.zadd('trench_sniper_leaderboard', { score, member: username });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Score Post Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}