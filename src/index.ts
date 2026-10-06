import express from "express";

const app = express();
app.use(express.json());

app.get("/", () => {
    
})

const PORT = 8000;
app.listen(PORT, () => console.log("server running or port :", PORT));