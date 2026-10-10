import 'dotenv/config';
import express from "express";
import http from "http";
import { matchRouter } from "./routes/matches";
import { commentaryRouter } from "./routes/commentary";
import { attachWebSocketServer } from './ws/server';
import { securityMiddleware } from "./security";


const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(securityMiddleware());

app.get("/health", (req, res) => {
    res.json({
        message : "Active"
    })    
})
 
app.use("/matches", matchRouter);
app.use("/commentary", commentaryRouter);

const { broadCastMatchCreated, broadCastCommentaryCreated } = attachWebSocketServer(server);
app.locals.broadCastMatchCreated = broadCastMatchCreated;
app.locals.broadCastCommentaryCreated = broadCastCommentaryCreated;
app.locals.broadcastCommentaryCreated = broadCastCommentaryCreated;


const PORT = Number(process.env.PORT || 8000);
const HOST = (process.env.HOST || "0.0.0.0");

server.listen(PORT, HOST, () => {
    const baseURL = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`Server running on : ${baseURL}`);
    console.log(`WebSocket server is running on : ${baseURL.replace("http", "ws")}/ws`);
});
