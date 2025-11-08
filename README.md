##### Creating the client websocket
```js
    // Treat this like a pairing code
    let pairingCode = "shit post here";

    // Need to get the right socket url from this endpoint.
    let url = `this-is-wendys-socket-service-dkc8eyd7bzc9hndh.canadacentral-01.azurewebsites.net/negotiate?pair=${pairingCode}`;

    fetch(url)
        .then(res => res.json())
        .then((token) => {
            // serverUrl will be a property of the returned data
            let socket = new WebSocket(token.serverUrl);
        });

```
##### Broadcasting data
```js
    socket.send({
        payload: "more shit post", // Whatever you wanna send here
        type: null // Leaving it like this for now
    });
```
#### Listening for data
Data will be broadcast to sockets in the following format:
```ts
    {
        payload: String,
        type: null,
        from: String,
    }
```
Add an event listener either with
```js
    socket.onmessage((event) => {
        // Data will always be in string format so convert when necessary.
        let jsonData = JSON.parse(event.data.payload);
        // Snippet for extracting raw byte data
        let byteData = (new TextEncoder()).encode(event.data.payload).buffer;
    });
```
or
```js
    socket.addEventListener("message", (event) => {
        let jsonData = JSON.parse(event.data.payload);
        let byteData = (new TextEncoder()).encode(event.data.payload).buffer;
    });
```