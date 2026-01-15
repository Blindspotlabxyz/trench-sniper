import { kv } from '@upstash/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  const scores = await kv.zrange('trench_sniper_leaderboard', 0, 99, { rev: true, withScores: true });
  return NextResponse.json(scores);
}

export async function POST(req: Request) {
  const { username, score } = await req.json();
  await kv.zadd('trench_sniper_leaderboard', { score, member: username });
  return NextResponse.json({ success: true });
}