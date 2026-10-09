import 'dotenv/config';
import express from "express";
import http from "http";
import { matchRouter } from "./routes/matches";
import { attachWebSocketServer } from './ws/server';


const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        message : "Active"
    })    
})
 
app.use("/matches", matchRouter);

const { broadCastMatchCreated } = attachWebSocketServer(server);
app.locals.broadCastMatchCreated = broadCastMatchCreated;


const PORT = Number(process.env.PORT || 8000);
const HOST = (process.env.HOST || "0.0.0.0");

server.listen(PORT, HOST, () => {
    const baseURL = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`Server running on : ${baseURL}`);
    console.log(`WebSocket server is running on : ${baseURL.replace("http", "ws")}/ws`);
});