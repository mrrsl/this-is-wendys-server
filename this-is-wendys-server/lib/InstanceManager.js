import { WebPubSubServiceClient } from "@azure/web-pubsub";
import { WebPubSubEventHandler } from "@azure/web-pubsub-express";

const ConnectionString  = "Endpoint=https://this-is-wendys-server.webpubsub.azure.com;AccessKey=4ZvFmmB6ToibLB8y67WFq0xjYIYKnrZx68gtqFBYSrBqeRGEttPXJQQJ99BKACBsN54XJ3w3AAAAAWPSYzxj;Version=1.0;";

/**
 * Handles user events on the socket. Intended to be passed through {@link Function.prototype.bind}.
 * @param {WebPubSubServiceClient.Request} req 
 * @param {WebPubSubServiceClient.Response} res 
 */
async function wsEventHandler(req, res) {
    if (req.context.eventName === "share") {
        await this.sendToAll({
            from: req.context.id,
            message: req.data
        });
    }
    res.success();
}

/**
 * Manages Azure WPS hubs
 */
export const WSManager = class {
    /**
     * @type {{[key:Number]: WebPubSubServiceClient}}
     */
    activeHubs;

    /**
     * @type {{[key: Number]: WebPubSubEventHandler}}
     */
    activeListeners;
    /** Number of connected clients. */
    clientCount;

    constructor() {
        this.activeHubs = {};
        this.activeListeners = {};
        this.clientCount = 0;
    }

    getInstance(pair) {
        if (this.activeHubs[pair])
            return this.activeHubs[pair];
        
        this.activeHubs[pair] = new WebPubSubServiceClient(
            ConnectionString,
            pair
        );

        this.activeListeners[pair] = new WebPubSubEventHandler({
            
        });

        return this.activeHubs[pair];
    }
}