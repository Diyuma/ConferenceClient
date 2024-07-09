function NewWebsocketConn(addr, toRunOnOpen, deserialize_f, messageEvent_f) {
    console.log("Init websocket connection ", addr);
    const socket = new WebSocket(addr);
    socket.binaryType = "arraybuffer";

    socket.addEventListener("open", (event) => {
        console.log("Openned websocket connection ", addr);
        for (let i = 0; i < toRunOnOpen.length; i++) {
            toRunOnOpen[i]();
        }
    })
    socket.addEventListener("message", (rawData) => {
        var msg = deserialize_f(new Uint8Array(rawData.data));
        messageEvent_f(msg);
    });
    return socket;
}

function SendWebsocket(msg, socket) {
    socket.send(msg.serializeBinary());
}