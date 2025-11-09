// const socketEndpoint = "ws://localhost:3000/ws";
const socketEndpoint = "wss://this-is-wendys-socket-service-dkc8eyd7bzc9hndh.canadacentral-01.azurewebsites.net/ws";
/**
 * Sets up the socket connection to the backend service
 * @param {String} pairingCode 
 * @param {(MessageEvent) => void} onmessage
 * @param {(Event) => void} onopen
 * @param {(CloseEvent) => void} onclose
 */
function createConnection(pairingCode, onmessage, onclose, onopen) {
    let ep = socketEndpoint;
    if (pairingCode) ep = `${ep}?group=${pairingCode}`;

    let socket = new WebSocket(ep);
    onmessage && socket.addEventListener("message", onmessage);
    onclose && socket.addEventListener("close", onclose);
    onopen && socket.addEventListener("open", onopen);
    return socket;
}

/**
 * Default message handler for printing to console.
 * @param {MessageEvent} mevent 
 */
function messageHandler(mevent) {
    console.log(`Data: ${mevent.data}`);
}

function init(event) {
    const output = document.querySelector("#display");
    const input = document.querySelector("input#messageInput");
    const enter = document.querySelector("button#sendButton");
    const enterPair = document.querySelector("button#pairButton");
    const inputPair = document.querySelector("input#pairInput");

    output.consoleQueue = [];

    function sendLine(text) {
        let line = document.createElement("p");
        line.textContent = text;
        output.consoleQueue.push(line);
        output.append(line);
        if (output.consoleQueue.length > 20) {
            output.consoleQueue.shift().remove();
        }
    }

    output.attachedWs = createConnection(null,
        (msg) => {
            sendLine("Recieved " + msg.data);
        },
        (close) => {
            sendLine("Connection closed");
        },
        (open) => {
            sendLine("Connection opened");
        }
    );

    enter.addEventListener("click", (event) => {
        let payload = JSON.stringify({data: input.value, type: "text/plain"});
        output.attachedWs.send(payload);
        sendLine(`Message sent ${input.value}`);
        input.value = "";
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            enter.click();
        }
    });

    enterPair.addEventListener("click", (ev) => {
        if (output.attachedWs) 
            output.attachedWs.close();

        output.attachedWs = createConnection(
            (inputPair.value.length > 0) ? inputPair.value : null,
            (msg) => {
                sendLine("Recieved " + msg.data);
            },
            (close) => {
                sendLine("Connection closed");
            },
            (open) => {
                sendLine("Connection opened");
            }
        );
    });

}
init();