import { WebSocket, WebSocketServer } from "ws";
import { wsSecurity, releaseWsConnection } from "../security";

declare module "ws" {
    interface WebSocket {
        isAlive?: boolean;
        subscriptions: Set<number>;
    }
}

const matchSubscribers = new Map<number, Set<WebSocket>>();

function subscribe(matchId: number, socket: WebSocket) {
    let subscribers = matchSubscribers.get(matchId);
    if (!subscribers) {
        subscribers = new Set<WebSocket>();
        matchSubscribers.set(matchId, subscribers);
    }
    subscribers.add(socket);
}

function unsubscribe(matchId: number, socket: WebSocket) {
    const subscribers = matchSubscribers.get(matchId);
    if (subscribers) {
        subscribers.delete(socket);
        if (subscribers.size === 0) {
            matchSubscribers.delete(matchId);
        }
    }
}

function cleanupSubscriptions(socket: WebSocket) {
    if (socket.subscriptions && socket.subscriptions.size > 0) {
        for (const matchId of socket.subscriptions) {
            unsubscribe(matchId, socket);
        }
        socket.subscriptions.clear();
    } else {
        for (const [matchId, subscribers] of matchSubscribers.entries()) {
            subscribers.delete(socket);
            if (subscribers.size === 0) {
                matchSubscribers.delete(matchId);
            }
        }
    }
}

function sendJson(socket: WebSocket, payload: unknown): boolean {
    if (socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
}

function broadcastToAll(wss: WebSocketServer, payload: unknown): number {
    let count = 0;
    const stringPayload = JSON.stringify(payload);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(stringPayload);
            count++;
        }
    });

    return count;
}

function broadcastToMatch(matchId: number, payload: unknown): number {
    const subscribers = matchSubscribers.get(matchId);
    if (!subscribers || subscribers.size === 0) return 0;

    let count = 0;
    const stringPayload = JSON.stringify(payload);

    subscribers.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(stringPayload);
            count++;
        }
    });

    return count;
}

function handleMessage(socket: WebSocket, data: any) {
    let message: any;

    try {
        message = JSON.parse(data.toString());
    } catch {
        sendJson(socket, { type: "error", message: "Invalid JSON" });
        return;
    }

    const type = message?.type || message?.action;
    const matchId = typeof message?.matchId === "number" ? message.matchId : Number(message?.matchId);

    if (type === "subscribe" && Number.isInteger(matchId)) {
        subscribe(matchId, socket);
        socket.subscriptions.add(matchId);
        sendJson(socket, { type: "subscribed", matchId });
    }

    if (type === "unsubscribe" && Number.isInteger(matchId)) {
        unsubscribe(matchId, socket);
        socket.subscriptions.delete(matchId);
        sendJson(socket, { type: "unsubscribed", matchId });
    }
}

export function attachWebSocketServer(server: any) {
    const wss = new WebSocketServer({
        noServer: true,
        path: "/ws",
        maxPayload: 1024 * 1024, // 1 megabyte
    });

    server.on("upgrade", async (req: any, socket: any, head: any) => {
        const url = req.url || "";
        if (!url.startsWith("/ws")) {
            socket.destroy();
            return;
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        });
    });

    wss.on("connection", async (socket, req) => {
        if (wsSecurity) {
            try {
                const decision = await wsSecurity.protect(req);

                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? "Rate limit exceeded" : "Access denied";

                    socket.close(code, reason);
                    return;
                }
            } catch (e) {
                console.error("WS connection error", e);
                socket.close(1011, "Server security error");
                return;
            }
        }

        socket.isAlive = true;
        socket.on("pong", () => {
            socket.isAlive = true;
        });

        socket.subscriptions = new Set<number>();

        sendJson(socket, { type: "welcome" });

        socket.on("message", (data) => {
            handleMessage(socket, data);
        });

        socket.on("error", () => {
            socket.terminate();
        });

        socket.on("error", console.error);

        socket.on("close", () => {
            releaseWsConnection(req);
            cleanupSubscriptions(socket);
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
    interval.unref();

    wss.on("close", () => clearInterval(interval));

    function broadcastMatchCreated(match: any) {
        broadcastToAll(wss, { type: "match_created", data: match });
    }

    function broadcastCommentaryCreated(commentary: any) {
        const matchId = Number(commentary.matchId);
        broadcastToMatch(matchId, { type: "commentary_created", data: commentary });
    }

    return {
        broadcastMatchCreated,
        broadCastMatchCreated: broadcastMatchCreated,
        broadcastCommentaryCreated,
        broadCastCommentaryCreated: broadcastCommentaryCreated,
        broadcastToAll,
        broadcastToMatch,
        subscribe,
        unsubscribe,
        cleanupSubscriptions,
        matchSubscribers,
        wss,
    };
}