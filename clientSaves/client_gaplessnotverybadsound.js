const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc-web");
const { Buffer } = require('buffer');

import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

await register(await connect());

const {ChatServerMessage, ChatClientMessage, EmptyMessage} = require('./proto/proto_pb.js');
const { SoundServiceClient } = require('./proto/proto_grpc_web_pb.js');

var client = new SoundServiceClient('http://0.0.0.0:8085');

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

let readyAmt = 0;
let soundDuration = 1000;
const { Gapless5 } = require('@regosen/gapless-5');
const player = new Gapless5({ guiId: 'gapless5-player-id', loadLimit: 500, exclusive: true, crossfade: 10, crossfadeShape: "Linear" });

player.onfinishedtrack = function (trackUrl) { void URL.revokeObjectURL(trackUrl)} ;

async function waitForAudio() {
    if (audioDeque.length != 0) {
        let url = prepareAudioUrl(audioDeque.shift());
        console.log(url);
        player.addTrack(url);
        readyAmt += 1
        if (readyAmt == 4) {
          player.play();
        }
        setTimeout(() => waitForAudio(), 50);
    } else {
        setTimeout(() => waitForAudio(), 100);
    }
}

waitForAudio()

/*audioPlayer.addEventListener("ended", (event) => {
    audioPlayer.src = resetAudio;
    audioPlayer.pause();
});*/

async function getSound() {
    var stream = client.getSound(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"});
    stream.on('data', function(response) {
        //console.log(response.getData())
        audioDeque.push(response.getData())
    });
}

async function sendSound(request) {
    client.sendSound(request, {"Access-Control-Allow-Origin": "*"}, (error, _) => {
        if (error) {
           console.error("Error:", error);
        }
    });
}

function prepareAudioUrl(data) {
    const blob = new Blob([data], { type: "audio/wav" });
    return URL.createObjectURL(blob);
}

/*
function playAudio(url) {
    audioPlayer.src = url;
    audioPlayer.play();
}*/


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

  function newAudioStreamWithRate(stream, rate) {
      const audioContext = new AudioContext({ sampleRate: rate });
      const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream: stream });
      const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext);
      mediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode);
      return new MediaRecorder(mediaStreamAudioDestinationNode.stream, { mimeType: 'audio/wav'});
  }
  
  let chunks = [];
  let recorder;
  function handlerFunction(stream) {
    function runRecorder() {
        recorder = newAudioStreamWithRate(stream, 20000);
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = e => sendToServer(new Blob(chunks, { type: "audio/wav" })); chunks = [];
        setTimeout(()=> {recorder.stop(); runRecorder()}, soundDuration); // ms
        recorder.start();
    }

    runRecorder()

    function sendToServer(blob) {
        blob.arrayBuffer().then(
            function(buf) {
              var request = new ChatClientMessage();
              request.setRate(20000);
              request.setReadyToSend(true);
              request.setData(Buffer.from(buf, 'binary'));

              //console.log("send");

              sendSound(request)
            }
        );
    }
  }
  function startusingBrowserMicrophone(boolean) {
    getUserMedia({ audio: boolean }).then((stream) => {
      handlerFunction(stream);
    });
  }
  startusingBrowserMicrophone(true);
  document.getElementById("stopRecording").addEventListener("click", (e) => {
      recorder.stop();
  });
}

$("#startStreamingButton").click(() => {
    getSound()
});