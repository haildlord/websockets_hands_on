import { WebSocket, WebSocketServer } from "ws";
import { wsSecurity, releaseWsConnection } from "../security";

function sendJson(socket : WebSocket, payload : unknown) : boolean {

    if(socket.readyState !== WebSocket.OPEN) return false;

    socket.send(JSON.stringify(payload));
    return true;
}

function broadCast(server : WebSocketServer, payload : unknown) : number {

    let count = 0;
    let stringPayload = JSON.stringify(payload);

    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(stringPayload);
            count++;
        }
    });

    return count;
}

declare module "ws" {
    interface WebSocket {
        isAlive?: boolean;
    }
}

export function attachWebSocketServer(server : any) {

    const wss = new WebSocketServer({
        server,
        path : "/ws",
        maxPayload : 1024 * 1024    // 1 megabyte 
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

        socket.on("close", () => {
            releaseWsConnection(req);
        });

        socket.isAlive = true;
        socket.on("pong", () => {
            socket.isAlive = true;
        });

        sendJson(socket, { type : "welcome"} );
        socket.on("error", console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on("close", () => clearInterval(interval));

    function broadcastMatchCreated(match : any){
        broadCast(wss, { type : "match_created", data : match } );
    }

    return { 
        broadcastMatchCreated,
        broadCastMatchCreated: broadcastMatchCreated 
    };

}