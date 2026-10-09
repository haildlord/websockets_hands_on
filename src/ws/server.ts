import { WebSocket, WebSocketServer } from "ws";

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

export function attachWebSocketServer(server : any) {

    const wss = new WebSocketServer({
        server,
        path : "/ws",
        maxPayload : 1024 * 1024    // 1 megabyte 
    })

    wss.on("connection", (socket, clients) => {
        sendJson(socket, { type : "WELCOME !"} );
        socket.on("error", console.error);
    })


    function broadCastMatchCreated(match : any){
        broadCast(wss, { type : "match_created", data : match } );
    }

    return {broadCastMatchCreated};

}