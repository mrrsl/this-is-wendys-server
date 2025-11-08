### Creating the client websocket
```js
    // Treat this like a pairing code
    let pairingCode = "dn";
    let url = `ws://this-is-wendys-socket-service-dkc8eyd7bzc9hndh.canadacentral-01.azurewebsites.net/ws?pair=${pairingCode}`;

    let socket = new WebSocket(url);
    socket.onopen = () => {
        // Do things when the socket is ready to use
    };
    socket.onmessage = () => {
        // Do things when socket receives data
    }
    socket.onclose = () => {
        // Do optional things when socket shuts off
    }

```
### Broadcasting data
```js
    socket.send({
        payload: "more shit posting", // Whatever you wanna send here
        type: null // Leaving it like this for now
    });
```
### Extracting data
Data will be broadcast to sockets in the following format:
```ts
    {
        payload: String,
        type: STring | null,
    }
```
Data will be in string form so use `JSON.parse` or `TextEncoder` if the expected payload isn't supposed to be text:
```js
    socket.onmessage((event) => {
        // Data will always be in string format so convert when necessary.
        let jsonData = JSON.parse(event.data.payload);
        // Snippet for extracting raw byte data
        let byteData = (new TextEncoder()).encode(event.data.payload).buffer;
    });
```