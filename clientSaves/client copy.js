const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc-web");
const { Buffer } = require('buffer');

import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

await register(await connect());

const {ChatServerMessage, ChatClientMessage, EmptyMessage} = require('./proto/proto_pb.js');
const { SoundServiceClient } = require('./proto/proto_grpc_web_pb.js');

var client = new SoundServiceClient('http://0.0.0.0:8085');

var {Noise, AutoFilter} = require("Tone");

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






let audioCtx;

    // Stereo
    let channels = 1;

    function init() {
      audioCtx = new AudioContext();
    }

    button.onclick = () => {
      if (!audioCtx) {
        init();
      }

    async function getData(arrayBuf) {
        let audioCtx = new AudioContext({sampleRate: 10000}); // 10000

        let decodedData = await audioCtx.decodeAudioData(arrayBuf); // audio is resampled to the AudioContext's sampling rate

        console.log(decodedData.length, decodedData.duration, decodedData.sampleRate, decodedData.numberOfChannels);

        return decodedData.getChannelData(0); 
    }

    const frameCount = 10000 * 100;

    const buffer = new AudioBuffer({
      numberOfChannels: channels,
      length: frameCount,
      sampleRate: 10000,
    });

    async function addToBuf() {
        const files = document.getElementById('my-file-input').files;

        for (let kk = 0; kk < 100; kk++) {
            let res = await getData(files[kk % 8]);
            console.log(res);


            for (let channel = 0; channel < channels; channel++) {
                // This gives us the actual array that contains the data
                const nowBuffering = buffer.getChannelData(channel);
                for (let i = 0; i < 10000; i++) {
                    // Math.random() is in [0; 1.0]
                    // audio needs to be in [-1.0; 1.0]
                    nowBuffering[i + kk * 10000] = res[i];
                  }
            }
            function delay(time) {
                return new Promise(resolve => setTimeout(resolve, time));
              }
        }
        
    }

    //addToBuf();












var Deque = require("collections/deque");
var audioDeque = new Deque();
const resetAudio = "about:blank";

let readyAmt = 0;
let soundDuration = 500; // 250 - minimum 500 - ok баланс между зарежкой и качеством
let crossFade = 10;
const { Gapless5 } = require('@regosen/gapless-5');
const player = new Gapless5({ guiId: 'gapless5-player-id', loadLimit: 500, exclusive: true, crossfade: crossFade});

player.onfinishedtrack = function (trackUrl) { void URL.revokeObjectURL(trackUrl)} ;

async function waitForAudio(lastUrl) { // we do not need such timeouts, later may make them larger
    if (audioDeque.length != 0) {
        //let url = prepareAudioUrl(audioDeque.shift());
        //console.log(url);
        //player.addTrack(url);
        /*const files = document.getElementById('my-file-input').files;
        console.log(files);
        
        for (let i = 0; i < 8; i++) {
          player.addTrack(URL.createObjectURL(files[i]))
        }*/
        readyAmt += 1
        if (readyAmt == 5) {
            //player.play();

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();
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

  let link = document.createElement('a');
  //let count = 0;
  
  let chunks = [[], []];
  let stopped = [true, true];
  function handlerFunction(stream) {
    let recorders = [newAudioStreamWithRate(stream, 10000), newAudioStreamWithRate(stream, 10000)];
    async function runRecorder(chunkInd) {
        recorders[chunkInd].ondataavailable = e => {
            chunks[chunkInd].push(e.data);
            if (stopped[chunkInd]) {
              sendToServer(new Blob(chunks[chunkInd], { type: "audio/wav" }));
              chunks[chunkInd] = [];
            }
        };
        //recorders[chunkInd].onstop = e => sendToServer(new Blob(chunks[chunkInd], { type: "audio/wav" })); chunks[chunkInd] = [];

        setTimeout(() => { runRecorder(chunkInd^1) }, soundDuration); // ms
        //setTimeout(() => { console.log("end") ; recorder.stop() }, soundDuration); // ms

        stopped[chunkInd] = false;
        stopped[chunkInd^1] = true;
        recorders[chunkInd].start();
        //setTimeout(() => { recorders[chunkInd^1].stop() }, 100); // ms
        recorders[chunkInd^1].stop();
        //recorders[chunkInd].start();
    }

    runRecorder(0)

    function sendToServer(blob) {
      //link.download = "file1.wav";
      //link.href = URL.createObjectURL(blob);
      //link.click();
      //URL.revokeObjectURL(link.href);
      //let url = prepareAudioUrl(blob);
        //console.log(url);


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

    /*const files = document.getElementById('my-file-input').files;
    var audio = new Audio(URL.createObjectURL(files[0]));
    var index=0; 
    function playNext() {
        if(index < 8) {
            // change src depending on index (local files like 1.mp3, 2.mp3 so on)
            let url = prepareAudioUrl(audioDeque.shift());
            audio.src = URL.createObjectURL(files[index])
            console.log("something!");
            audio.load(); audio.play();
            index += 1;
        } else {
            audio.removeEventListener('ended', playNext, false);
        }
    }

    audio.addEventListener('ended', playNext);

    audio.play();*/
});