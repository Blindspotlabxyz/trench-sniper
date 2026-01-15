import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// This grabs your environment variables automatically
const redis = Redis.fromEnv();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await redis.zrange('trench_leaderboard', 0, 14, {
      rev: true,
      withScores: true,
    });

    const formatted = [];
    if (data) {
      for (let i = 0; i < data.length; i += 2) {
        formatted.push({
          username: data[i],
          score: data[i + 1],
        });
      }
    }
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { username, score } = await req.json();
    if (!username || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid Intel' }, { status: 400 });
    }

    await redis.zadd('trench_leaderboard', { score, member: username });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
