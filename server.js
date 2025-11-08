import { WebPubSubServiceClient } from "@azure/web-pubsub";
import express from "express";
import path from "path";

import { WSManager } from "./lib/InstanceManager.js";

const server = express();

const manager = new WSManager();

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
async function negotiate(req, res) {
    let pairNumber = req.query["pair"];
    if (!pairNumber) {
        res.status(400).send("Need pairing code");
    } else {

        let token = await manager.managedHub.getClientAccessToken({userId: `${Math.random()}-${pairNumber}`});
        res.json({
            // This is what client fetches to construct the new Websocket with.
            serverUrl: token.url
        });
    }
}

server.get("/negotiate", negotiate);
server.get("/", (req, res) => {
    res.sendFile(path.resolve("./test/index.html"));
});

server.listen(process.env.PORT || 3000);