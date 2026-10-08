import express from "express";
import { matchRouter } from "./routes/matches";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        message : "Active"
    })    
})
 
app.use("/matches", matchRouter);


const PORT = 8000;
app.listen(PORT, () => console.log("server running or port :", PORT));