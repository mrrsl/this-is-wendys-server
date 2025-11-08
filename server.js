import express from "express";
import path from "path";

import { SocketManager } from "./lib/WSInstance.js";

const server = express();


server.get("/", (req, res) => {
    res.sendFile(path.resolve("./test/index.html"));
});
/**
 * Return client's IP to itself.
 */
server.get("/stun", (req, res) => {
    res.send(req.ip);
});

const manager = new SocketManager(server.listen(process.env.PORT || 3000));