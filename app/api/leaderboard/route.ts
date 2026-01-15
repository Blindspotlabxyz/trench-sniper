import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const scores = await redis.zrange('trench_sniper_leaderboard', 0, 9, { 
      rev: true, 
      withScores: true 
    });
    return NextResponse.json(scores || []);
  } catch (error) {
    return NextResponse.json([]);
  }
}