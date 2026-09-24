type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let redisClient: { incr: (key: string) => Promise<number>; expire: (key: string, seconds: number) => Promise<unknown> } | null | undefined;

async function redis() {
    if (redisClient !== undefined) return redisClient;
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) { redisClient = null; return redisClient; }
    const { Redis } = await import("@upstash/redis");
    redisClient = Redis.fromEnv();
    return redisClient;
}

export async function checkRateLimit(key: string, limit: number, windowMs: number) {
    const client = await redis();
    if (client) {
        const count = await client.incr(`ratelimit:${key}`);
        if (count === 1) await client.expire(`ratelimit:${key}`, Math.ceil(windowMs / 1000));
        return count > limit ? Math.ceil(windowMs / 1000) : null;
    }
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return null; }
    current.count += 1;
    return current.count > limit ? Math.ceil((current.resetAt - now) / 1000) : null;
}