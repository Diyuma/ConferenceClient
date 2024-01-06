const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("./example/example.proto", { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const example = grpc.loadPackageDefinition(packageDefinition).example;

const client = new example.ExampleService("localhost:8080", grpc.credentials.createInsecure());

const request = { message: "World" };

client.SendMessage(request, (error, response) => {
  if (!error) {
    console.log("Response:", response.reply);
  } else {
    console.error("Error:", error);
  }
});
