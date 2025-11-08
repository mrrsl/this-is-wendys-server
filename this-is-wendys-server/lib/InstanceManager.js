import { WebPubSubServiceClient } from "@azure/web-pubsub";
import {
    WebPubSubEventHandler,
    ConnectedRequest,
    DisconnectedRequest,
    UserEventRequest,
    UserEventResponse
} from "@azure/web-pubsub-express";

const ConnectionString  = "Endpoint=https://this-is-wendys-server.webpubsub.azure.com;AccessKey=4ZvFmmB6ToibLB8y67WFq0xjYIYKnrZx68gtqFBYSrBqeRGEttPXJQQJ99BKACBsN54XJ3w3AAAAAWPSYzxj;Version=1.0;";
const HubName = "shitpost here ryan";

/**
 * Handles user events on the socket. Intended to be passed through {@link Function.prototype.bind}.
 * @param {WebPubSubServiceClient} wpsClient 
 * @param {UserEventRequest} req 
 * @param {UserEventResponse} res 
 */
async function wsEventHandler(wpsClient, req, res) {
    if (req.context.eventName === "share") {
        await wpsClient.sendToAll({
            from: req.context.id,
            message: req.data
        });
    }
    res.success();
}

/**
 * Handle managing connection counts. Use through {@link Function.prototype.bind}.
 * @param {WSManager} man Manager instance.
 * @param {DisconnectedRequest} dcReq
 */
function disconnectHandler(man, dcReq) {
    man.clientCount--;
}

/**
 * 
 * @param {WebPubSubServiceClient} wpsClient 
 * @param {ConnectedRequest} cReq 
 */
function connectHandler(wpsClient, cReq) {
    let id = cReq.context.userId
}

/**
 * Manages Azure WPS hubs
 */
export const WSManager = class {
    /**
     * @type {WebPubSubServiceClient}
     */
    managedHub;

    /**
     * @type {WebPubSubEventHandler}
     */
    handlerRef;

    /** Number of connected clients. */
    clientCount;

    /**
     * User id map of the groups they belong to.
     * @type {{[key: string]: string}}
     */
    clientList = {}

    constructor() {
        this.activeGroups = {};
        this.clientCount = 0;
        this.managedHub = new WebPubSubServiceClient(ConnectionString, HubName);

        this.handlerRef = new WebPubSubEventHandler(HubName, {
            handleUserEvent: wsEventHandler.bind(this, this.managedHub),
            onConnected: connectHandler.bind(this, this.managedHub),
            onDisconnected: disconnectHandler.bind(null, this)
        });
    }

    getInstance(pair) {
        if (this.managedHub.groupExists(pair)) {
            return this.managedHub.group(pair);
        }
        return null;
    }

    /** */
    expectUser(id, groupName) {

    }
}