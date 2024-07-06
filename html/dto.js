function NewWebsocketConn(addr, deserialize_f, messageEvent_f) {
    console.log("Init websocket connection ", addr);
    const socket = new WebSocket(addr + "/getsound");
    socket.binaryType = "arraybuffer";

    socket.addEventListener("open", (event) => {
        console.log("Openned websocket connection ", addr);
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