import { WebPubSubServiceClient } from "@azure/web-pubsub";
import express from "express";

import { WSManager } from "./lib/InstanceManager";

const server = express();

const manager = new WSManager();

/**
 * 
 * @param {WebPubSubServiceClient.Request} req 
 * @param {WebPubSubServiceClient.Response} res 
 */
async function wsHandler(req, res) {
    if (req.context.eventName === "message") {
        await pubsubService.sendToAll({
            from: req.context.userId,
            message: req.data
        });
        res.success();
    }
}

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
async function negotiate(req, res) {
    let pairNumber = req.query.pair;
    if (!pairNumber) {
        res.status(400).send("Need pairing code");
    } else if (manager.clientCount > 19) {

    } else {
        let desiredService = manager.getInstance(pairNumber);
            new WebPubSubServiceClient(cstring, pairNumber);
        let token = await desired.getClientAccessToken({pair: pairNumber, user: Math.random()});
        res.json({
            serverUrl: token.url
        });
    }
}

server.get("/negotiate", negotiate);

server.listen(process.env.PORT || 3000);