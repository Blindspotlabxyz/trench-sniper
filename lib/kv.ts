import { createClient } from '@vercel/kv';

export const kvClient = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const LEADERBOARD_KEY = 'trench_sniper_leaderboard';
export const MAX_LEADERBOARD_SIZE = 10;