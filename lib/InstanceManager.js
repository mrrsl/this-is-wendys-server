import { WebPubSubServiceClient } from "@azure/web-pubsub";
import {
    WebPubSubEventHandler
} from "@azure/web-pubsub-express";

const ConnectionString  = "Endpoint=https://this-is-wendys-server.webpubsub.azure.com;AccessKey=4ZvFmmB6ToibLB8y67WFq0xjYIYKnrZx68gtqFBYSrBqeRGEttPXJQQJ99BKACBsN54XJ3w3AAAAAWPSYzxj;Version=1.0;";
const HubName = "dollarmenu";

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

    constructor() {
        this.activeGroups = {};
        this.clientCount = 0;
        this.managedHub = new WebPubSubServiceClient(ConnectionString, HubName);

        this.handlerRef = new WebPubSubEventHandler(HubName, {
            handleUserEvent: this.wsEventHandler,
            onConnected: this.connectHandler,
            onDisconnected: this.disconnectHandler
        });
    }
    /**
     * 
     * @param {ConnectedRequest} cReq 
     */
    connectHandler(cReq) {
        let id = cReq.context.userId;
        if (!id) {
            this.managedHub.closeConnection(cReq.context.connectionId);
            return;
        }
        let groupName = id.split("-");
        if (groupName.length < 2) {
            this.managedHub.closeConnection(cReq.context.connectionId);
            return;
        }
        let group = this.managedHub.group(groupName[1]);
        group.addConnection(cReq.context.connectionId)

    }
    /**
     * Handles user events on the socket. Intended to be passed through {@link Function.prototype.bind}.
     * @param {WebPubSubServiceClient} wpsClient 
     * @param {UserEventRequest} req 
     * @param {UserEventResponseHandler} res 
     */
    async wsEventHandler(wpsClient, req, res) {
        if (req.context.eventName !== "message") return;
        if (req.context.userId) {
            try {
                var groupName = req.context.userId.split("-")
                groupName = groupName[1];
            } catch (e) {
                res.fail();
                wpsClient.closeConnection(req.context.connectionId);
            }
            let group = wpsClient.group(groupName);
            // Message structure here
            group.sendToAll({
                from: req.context.userId,
                payload: req.data.payload,
                type: req.dataType
            })
        }
        res.success();
    }
    /**
     * Handle managing connection counts. Use through {@link Function.prototype.bind}.
     * @param {DisconnectedRequest} dcReq
     */
    disconnectHandler(dcReq) {
        this.clientCount--;
    }
}