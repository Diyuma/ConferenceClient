const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("./proto/proto.proto", { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const proto = grpc.loadPackageDefinition(packageDefinition).proto;

const client = new proto.SoundService("localhost:8080", grpc.credentials.createInsecure());

const { Buffer } = require('node:buffer');

const buf = Buffer.alloc(5, 'a');

const request = { data: buf, rate: 1, ready_to_send: false};

var call = client.GetSoundJustHello();
call.on('data', function(note) {
    console.log('Got message ' + note.rate, note.data);
    console.log(note.data.toString('ascii'));
});

//call.on('end', callback); ???

async function send(data) {
    call.write(data);
    call.end();
}

send(request);