import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import url from "url";
import { EventEmitter } from "node:events";

const socketIdField = "sgID";
const groupIdField = "gID";

const TYPE_MATRIX = {
    STRING: "string",
    BLOB: "blob",
    PNG: "png",
    JPG: "jpg",
    PDF: "pdf",
}

const emptyEvent = "group_empty";

/**
 * 
 * @param {*} data 
 * @param {*} type 
 */
function generatePayload(data, type) {
    return {
        data: data,
        type: type
    };
}

export const SocketGroup = class extends EventEmitter {
    /**
     * Socket map.
     * @type {{[key: Number]: WebSocket}}
     */
    sockets;

    groupId;

    constructor(groupId) {
        super();
        this.groupId = groupId;
        this.sockets = {};
    }

    /**
     * Adds socket to group
     * @param {WebSocket} ws 
     */
    addSocket(ws) {
        let generatedId = uuidv4();
        ws[socketIdField] = generatedId;
        this.sockets[generatedId] = ws;
        ws.onmessage = this.perSocketMessage.bind(this, ws);
        ws.onclose = this.perSocketClose.bind(this, ws);
    }

    removeSocket(id) {
        if (sockets[id]) {
            this.perSocketClose(sockets[id]);
            markedSocket.terminate();
        }
    }

    /**
     * Message event handler for each socket.
     * @param {WebSocket} ws
     * @param {MessageEvent} mEv 
     */
    perSocketMessage(ws, mEv) {
        if (mEv.data == "ping") {
            console.log("Got pinged by socket", ws[socketIdField], " in group ");
            ws.send("pong");
            return;
        }
        for (let id of Object.keys(this.sockets)) {
            //if (id != ws[socketIdField])
                this.sockets[id].send(mEv.data);
        }
    }

    length() {
        return Object.keys(this.sockets).size;
    }

    perSocketClose(ws, code, buff) {
        let key = ws[socketIdField];
        ws[socketIdField] = undefined;

        delete this.sockets[key];

        if (Object.keys(this.sockets).length < 1) {
            this.emit(emptyEvent, this.groupId);
        }
    }
}

export const SocketManager = class {
    /**
     * @type {WebSocketServer}
     */
    wsServe;

    /**
     * Groups of websockets.
     * @type {{[key: String]: SocketGroup}}
     */
    groups;

    constructor(nodeServer) {
        const serverConfig = {
            server: nodeServer,
            clientTracking: true,
            host: "ws",
        }

        this.wsServe = new WebSocketServer(serverConfig);
        this.wsServe.on("connection", this.connectionHandler.bind(this));

        this.groups = {};
    }

    /**
     * 
     * @param {WebSocket} ws 
     * @param {http.IncomingMessage} req 
     */
    connectionHandler(ws, req) {
    
        let resource = new url.URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
        let groupName = resource.search;
        
        // Check for group name parameters
        try {
            groupName = groupName.substring(1).split('=');
        } catch (err) {
            let anonGroup = this.generateAnonymousGroup();
            anonGroup.addSocket(ws);
            anonGroup.on(emptyEvent, (groupId) => delete this.groups[groupId]);
        }

        if (groupName[0] == "group") {
            if (this.groups[groupName[1]]) {
                this.groups[groupName[1]].addSocket(ws);
            } else {
                this.groups[groupName[1]] = new SocketGroup(groupName[1]);
                this.groups[groupName[1]].on(emptyEvent, (groupId) => delete this.groups[groupId]);
                this.groups[groupName[1]].addSocket(ws);
            }
        }
    }

    getUniqueGroupId() {
        let candidate = uuidv4().split("-");
        while (this.groups[candidate[1]]) {
            candidate = uuidv4().split("-");
        }
    }
    
    generateAnonymousGroup() {
        let groupName = this.getUniqueGroupId();
        this.groups[groupName] = new SocketGroup();
        return this.groups[groupName];
    }
}