import express from "express";
import path from "path";

import { SocketManager } from "./lib/WSInstance.js";

const server = express();

server.use(express.static(path.resolve("./test")));
server.get("/", (req, res) => {
    res.sendFile(path.resolve("./test/preview.html"));
});
/**
 * Return client's IP to itself.
 */
server.get("/stun", (req, res) => {
    res.send(req.ip);
});

server.get("/newgroup", (req, res) => {
    res.send(manager.getUniqueGroupId());
});
const manager = new SocketManager(server.listen(process.env.PORT || 3000));