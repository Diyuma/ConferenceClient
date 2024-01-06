const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("./example/example.proto", { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const example = grpc.loadPackageDefinition(packageDefinition).example;

const client = new example.ExampleService("localhost:8080", grpc.credentials.createInsecure());

const request = { message: "World" };

var call = client.SendMessage();
call.on('data', function(note) {
  console.log('Got message ' + note.reply);
});

//call.on('end', callback); ???

async function send(data) {
    var notes = [data, data];
    for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        console.log('Send message ' + note.message);
        call.write(note);
    }
    call.end();
}

send(request);