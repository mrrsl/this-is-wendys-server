import WebSocket, { WebSocketServer } from "ws";
import url from "url";

const socketIdField = "sgID";
const groupIdField = "gID";

const CLIENT_LIMIT = 20;

export const SocketGroup = class {

    /** Lazy ID generation */
    idCounter;

    /**
     * Socket map.
     * @type {{[key: Number]: WebSocket}}
     */
    sockets;

    constructor() {
        
        this.idCounter = 0;
        this.sockets = {};
    }

    /**
     * Adds socket to group
     * @param {WebSocket} ws 
     */
    addSocket(ws) {
        ws[socketIdField] = this.idCounter;
        this.sockets[this.idCounter++] = ws;
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
            console.log("Got pinged by socket", ws[socketIdField], " in group " , ws[groupIdField]);
            ws.send("pong");
            return;
        }
        for (let id of Object.keys(this.sockets)) {
            if (id != ws[socketIdField])
                this.sockets[id].send(mEv.data);
        }
    }

    length() {
        return Object.keys(this.sockets).size;
    }

    perSocketClose(ws, code, buff) {
        let key = ws[socketIdField];
        ws[groupIdField] = undefined;
        ws[socketIdField] = undefined;

        delete this.sockets[key];


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
    
        try {
            groupName = groupName.substring(1).split('=');
        } catch (err) {
            ws.terminate();
            return;
        }

        if (groupName[0] == "group") {
            if (this.groups[groupName[1]]) {
                this.groups[groupName[1]].addSocket(ws);
            } else {
                this.groups[groupName[1]] = new SocketGroup();
                this.groups[groupName[1]].addSocket(ws);
            }
            ws[groupIdField] = this.groups[groupName[1]];
        }
    }
}