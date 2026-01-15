import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

/** * These variables are the 'locked' ones you see in your Vercel Settings.
 * Vercel's Upstash integration automatically provides these.
 */
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function GET() {
  try {
    const scores = await redis.zrange('trench_sniper_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });
    return NextResponse.json(scores || []);
  } catch (error) {
    console.error("Redis Error:", error);
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
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
