import express from "express";
import path from "path";

import { SocketManager } from "./lib/WSInstance.js";

const server = express();


server.get("/", (req, res) => {
    res.sendFile(path.resolve("./test/index.html"));
});

const manager = new SocketManager(server.listen(process.env.PORT || 3000));