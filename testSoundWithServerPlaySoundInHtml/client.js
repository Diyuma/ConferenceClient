const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc-web");
const { Buffer } = require('buffer');

const {ChatServerMessage, ChatClientMessage, EmptyMessage} = require('https://cdn.jsdelivr.net/gh/Diyuma/ConferenceClient@main/testSoundWithServerPlaySoundInHtml/proto/proto_pb.js');
const { SoundServiceClient } = require('https://cdn.jsdelivr.net/gh/Diyuma/ConferenceClient@main/testSoundWithServerPlaySoundInHtml/proto/proto_grpc_web_pb.js');

console.log(ChatClientMessage)
var client = new SoundServiceClient('http://localhost:8085');

/*var request = new ChatClientMessage();
request.setData('Hello World!');

const { Buffer } = require('buffer');
const buf = Buffer.alloc(5, 'a');

echoService.echo(request, {}, function(err, response) {
  // ...
});*/

/*var request = new ChatClientMessage();

const buf = Buffer.alloc(5, 'a');

request.setData(buf);
request.setRate(100);
request.setReadyToSend(false);


async function send(data) {
    client.getSoundJustHello(data, {"Access-Control-Allow-Origin": "*"}, function(err, response) {
        console.log("***");
        console.log(err, response);
    });

}
send(request);

module.exports = {send};*/

var Deque = require("collections/deque");
var audioDeque = new Deque();
const resetAudio = "about:blank";

async function waitForAudio() {
    if (audioDeque.length != 0) {
        playAudio(audioDeque.shift());
    } else {
        setTimeout(() => waitForAudio(), 100)
    }
}

waitForAudio()

audioPlayer.addEventListener("ended", (event) => {
    audioPlayer.src = resetAudio;
    audioPlayer.pause();

    if (audioDeque.length != 0) {
        playAudio(audioDeque.shift());
    } else {
        waitForAudio()
    }
});

function doRequest() {
    var request = new ChatClientMessage();

    const buf = Buffer.alloc(5, 'a');

    request.setData(buf);
    request.setRate(100);
    request.setReadyToSend(false);

    var stream = client.getSound(request, {"Access-Control-Allow-Origin": "*"});
    stream.on('data', function(response) {
        for (let i = 0; i < 100; i++) {
            audioDeque.push(response.getData())
        }
    });

    stream.on('status', function(status) {
        console.log(status.code);
        console.log(status.details);
        console.log(status.metadata);
    });
    stream.on('end', function(end) {
    // stream end signal
    });
}


// to close the stream
//stream.cancel()

function playAudio(data) {
    // Create a Blob from the audio data
    const blob = new Blob([data], { type: "audio/wav" });

    // Create a URL for the Blob
    const audioUrl = URL.createObjectURL(blob);

    // Set the audio source and play
    audioPlayer.src = audioUrl;
    audioPlayer.play();
}


document.getElementById("startRecording").addEventListener("click", initFunction);
let isRecording = document.getElementById("isRecording");
function initFunction() {
  async function getUserMedia(constraints) {
    if (window.navigator.mediaDevices) {
      return window.navigator.mediaDevices.getUserMedia(constraints);
    }
    let legacyApi =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    if (legacyApi) {
      return new Promise(function (resolve, reject) {
        legacyApi.bind(window.navigator)(constraints, resolve, reject);
      });
    } else {
      alert("user api not supported");
    }
  }

  let audioChunks = [];
  let rec;
  function handlerFunction(stream) {
    rec = new MediaRecorder(stream);
    rec.start();
    rec.ondataavailable = (e) => {
      audioChunks.push(e.data);
      if (rec.state == "inactive") {
        let blob = new Blob(audioChunks, { type: "audio/mp3" });
        console.log(blob);
        let blob2 = new Blob(audioChunks, { type: "audio/wav" });
        console.log(blob2);
      }
    };
  }
  function startusingBrowserMicrophone(boolean) {
    getUserMedia({ audio: boolean }).then((stream) => {
      handlerFunction(stream);
    });
  }
  startusingBrowserMicrophone(true);
  document.getElementById("stopRecording").addEventListener("click", (e) => {
    rec.stop();
  });
}

/*$("#startStreamingButton").click(() => {
    doRequest()
});*/

//$("#startStreamingButton").on('click', doRequest());

/*const button = document.querySelector('button');

// Add an event listener to the button that listens for the click event
button.addEventListener('click', function() {
  // Display the prompt when the button is clicked
  
  console.log(1123);
});*/


$("#startStreamingButton").click(() => {
    doRequest()
});


//send(request);

/*var call = client.GetSoundJustHello();
call.on('data', function(note) {
    console.log('Got message ' + note.rate, note.data);
    console.log(note.data.toString('ascii'));
});

async function send(data) {
    call.write(data);
    call.end();
}

send(request);*/

/*client.GetSoundJustHello(request, {}, function(err, response) {
    console.log('Got message ' + response.rate, response.data);
})*/
/*const request = { data: buf, rate: 1, ready_to_send: false};

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

send(request);*/

/*const { Buffer } = require('buffer');

const packageDefinition = protoLoader.loadSync("./proto/proto.proto", { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const proto = grpc.loadPackageDefinition(packageDefinition).proto;

const client = new proto.SoundService("localhost:8080", grpc.credentials.createInsecure());

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

send(request);*/