import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// This automatically uses KV_REST_API_URL and KV_REST_API_TOKEN
const redis = Redis.fromEnv();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetches top 15 scores from the Redis Sorted Set
    const data = await redis.zrange('trench_leaderboard', 0, 14, {
      rev: true,
      withScores: true,
    });

    const formatted = [];
    for (let i = 0; i < data.length; i += 2) {
      formatted.push({
        username: data[i],
        score: data[i + 1],
      });
    }
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Redis Get Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { username, score } = await req.json();
    if (!username || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Saves the score to the Sorted Set
    await redis.zadd('trench_leaderboard', { score, member: username });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Redis Post Error:", error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
