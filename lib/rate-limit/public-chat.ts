import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "preffer:public-chat",
});

export async function enforcePublicChatRateLimit(ip: string) {
  const result = await ratelimit.limit(ip);

  if (!result.success) {
    return {
      success: false as const,
      reset: result.reset,
      remaining: result.remaining,
    };
  }

  return {
    success: true as const,
    remaining: result.remaining,
  };
}
