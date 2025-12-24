import prisma from '../db';

const MAX_QUERIES_PER_DAY = parseInt(process.env.MAX_QUERIES_PER_DAY || '5', 10);
const ROLLING_WINDOW_HOURS = 24;

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    used: number;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
    const windowStart = new Date(Date.now() - ROLLING_WINDOW_HOURS * 60 * 60 * 1000);

    const queryCount = await prisma.queryUsage.count({
        where: {
            userId,
            queryTimestamp: {
                gte: windowStart,
            },
        },
    });

    // Find the oldest query in the window to calculate reset time
    const oldestQuery = await prisma.queryUsage.findFirst({
        where: {
            userId,
            queryTimestamp: {
                gte: windowStart,
            },
        },
        orderBy: {
            queryTimestamp: 'asc',
        },
    });

    const resetAt = oldestQuery
        ? new Date(oldestQuery.queryTimestamp.getTime() + ROLLING_WINDOW_HOURS * 60 * 60 * 1000)
        : new Date(Date.now() + ROLLING_WINDOW_HOURS * 60 * 60 * 1000);

    return {
        allowed: queryCount < MAX_QUERIES_PER_DAY,
        remaining: Math.max(0, MAX_QUERIES_PER_DAY - queryCount),
        resetAt,
        used: queryCount,
    };
}

export async function recordQuery(userId: string): Promise<void> {
    await prisma.queryUsage.create({
        data: {
            userId,
        },
    });
}

export async function getRateLimitStatus(userId: string): Promise<RateLimitResult> {
    return checkRateLimit(userId);
}
