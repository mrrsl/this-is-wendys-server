const socketEndpoint = "ws://localhost:3000/ws?group=";
//const socketEndpoint = "wss://this-is-wendys-socket-service-dkc8eyd7bzc9hndh.canadacentral-01.azurewebsites.net/ws?group=";
const pairCode = "mygoat";
/**
 * Sets up the socket connection to the backend service
 * @param {String} pairingCode 
 * @param {(MessageEvent) => void} onmessage
 * @param {(Event) => void} onopen
 * @param {(CloseEvent) => void} onclose
 */
function createConnection(pairingCode, onmessage, onclose, onopen) {
    let socket = new WebSocket(socketEndpoint + pairCode);
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
    const input = document.querySelector("input");
    const enter = document.querySelector("button");

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

    output.attachedWs = createConnection(pairCode,
        (msg) => {
            debugger;
            let dataObj = JSON.parse(msg.data);
            sendLine("Recieved " + dataObj.data);
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
}
init();