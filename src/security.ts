import type { Request, Response, NextFunction } from "express";
import type http from "http";

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

// In-memory trackers
const httpLimitMap = new Map<string, RateLimitRecord>();
const wsActiveConnections = new Map<string, number>();

// Limits configuration
const HTTP_WINDOW_MS = 60 * 1000; // 1 minute
const HTTP_MAX_REQUESTS = 60;      // max 60 requests per minute per IP
const WS_MAX_CONNECTIONS = 5;      // max 5 concurrent WebSocket connections per IP

/**
 * Express HTTP Rate-Limiting & Security Middleware
 * Protects all REST endpoints from spam and denial-of-service.
 */
export function securityMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = (req.ip || req.socket.remoteAddress || "unknown").toString();
        const now = Date.now();

        const record = httpLimitMap.get(ip) || { count: 0, resetTime: now + HTTP_WINDOW_MS };

        // Reset if the 1-minute window has passed
        if (now > record.resetTime) {
            record.count = 0;
            record.resetTime = now + HTTP_WINDOW_MS;
        }

        record.count++;
        httpLimitMap.set(ip, record);

        // Block if too many requests
        if (record.count > HTTP_MAX_REQUESTS) {
            const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader("Retry-After", retryAfterSec);
            return res.status(429).json({
                error: "Too Many Requests",
                message: `Rate limit exceeded. Try again in ${retryAfterSec} seconds.`,
            });
        }

        next();
    };
}

/**
 * WebSocket Connection Guard (matches Arcjet .protect() API)
 * Rejects connection flooding from any single IP.
 */
export interface WsSecurityDecision {
    isDenied(): boolean;
    reason: {
        isRateLimit(): boolean;
        message?: string;
    };
}

export const wsSecurity = {
    async protect(req: http.IncomingMessage): Promise<WsSecurityDecision> {
        const ip = (req.socket.remoteAddress || "unknown").toString();
        const current = wsActiveConnections.get(ip) || 0;

        if (current >= WS_MAX_CONNECTIONS) {
            return {
                isDenied: () => true,
                reason: {
                    isRateLimit: () => true,
                    message: "Rate limit exceeded",
                },
            };
        }

        wsActiveConnections.set(ip, current + 1);
        return {
            isDenied: () => false,
            reason: {
                isRateLimit: () => false,
            },
        };
    },
};

export function checkWsSecurity(req: http.IncomingMessage): { allowed: boolean; reason?: string } {
    const ip = (req.socket.remoteAddress || "unknown").toString();
    const current = wsActiveConnections.get(ip) || 0;

    if (current >= WS_MAX_CONNECTIONS) {
        return {
            allowed: false,
            reason: `Too many active connections from IP: ${ip}. Max is ${WS_MAX_CONNECTIONS}.`,
        };
    }

    wsActiveConnections.set(ip, current + 1);
    return { allowed: true };
}

/**
 * Decrement active WS connections count when a client disconnects.
 */
export function releaseWsConnection(req: http.IncomingMessage): void {
    const ip = (req.socket.remoteAddress || "unknown").toString();
    const current = wsActiveConnections.get(ip) || 1;
    if (current <= 1) {
        wsActiveConnections.delete(ip);
    } else {
        wsActiveConnections.set(ip, current - 1);
    }
}
