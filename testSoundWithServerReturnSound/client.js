const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc-web");
const { Buffer } = require('buffer');
var Deque = require("collections/deque");

import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

await register(await connect());

const {ChatServerMessage, ChatClientMessage, EmptyMessage} = require('./proto/proto_pb.js');
const { SoundServiceClient } = require('./proto/proto_grpc_web_pb.js');

var client = new SoundServiceClient('http://0.0.0.0:8085');

// SOUND PLAYER FUNCS
var audioDeque = new Deque();

// I don't know why, but I need it , it makes sound better without using it:)
let crossFade = 10;
const { Gapless5 } = require('@regosen/gapless-5');
const player = new Gapless5({ guiId: 'gapless5-player-id', loadLimit: 500, exclusive: true, crossfade: crossFade});
// end of non-understandable part

function initSoundPlayer() {
    let audioCtx;
    let buffer;
    function prepareSoundPlayer() {
        audioCtx = new AudioContext();
        let channels = 1;

        const frameCount = 10000 * 100;

        buffer = new AudioBuffer({
            numberOfChannels: channels,
            length: frameCount,
            sampleRate: 10000,
        });
    }

    let readyAmt = 0;
    let LastBufferIndex = 0;

    async function waitForAudio() { // we do not need such timeouts, later may make them larger
        if (audioDeque.length != 0) {
            let toAdd = await serverBytesWavDataToWaveArray(audioDeque.shift());
            const nowBuffering = buffer.getChannelData(0);
            for (let i = 0; i < toAdd.length; i++) {
                nowBuffering[i + LastBufferIndex] = toAdd[i];
            }
    
            LastBufferIndex += toAdd.length;
    
            readyAmt += 1
    
            if (readyAmt == 5) {
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

    prepareSoundPlayer()
    waitForAudio();
}

initSoundPlayer();


// CLIENT-SERVER FUNCS
async function serverBytesWavDataToWaveArray(serverData) {
    let blobData =  new Blob([serverData], { type: "audio/wav" });
    let arrayBuf = await blobData.arrayBuffer();
    let audioCtx = new AudioContext({sampleRate: 10000});
    let decodedData = await audioCtx.decodeAudioData(arrayBuf);

    return decodedData.getChannelData(0); 
}

async function getSound() {
    var stream = client.getSound(new EmptyMessage(), {"Access-Control-Allow-Origin": "*"});
    stream.on('data', function(response) {
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

function sendAudioBlobDataToServer(blob) {
  blob.arrayBuffer().then(
      function(buf) {
          var request = new ChatClientMessage();
          request.setRate(10000);
          request.setReadyToSend(true);
          request.setData(Buffer.from(buf, 'binary'));

          sendSound(request)
      }
  );
}

let soundDuration = 500; // 250 - minimum 500 - ok баланс между зарежкой и качеством

//RECORDER FUNCS
document.getElementById("startRecording").addEventListener("click", initRecorder);
function initRecorder() {
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
  
    let recordedChunks = [[], []];
    let isRecorderStopped = [true, true];
    let HaveToStop = false;
    function handleMicrophoneOn(stream) {
        let recorders = [newAudioStreamWithRate(stream, 10000), newAudioStreamWithRate(stream, 10000)];
        isRecorderStopped[0] = false;

        async function runRecorder(chunkInd) {
            recorders[chunkInd].ondataavailable = e => {
                recordedChunks[chunkInd].push(e.data);
                if (isRecorderStopped[chunkInd]) {
                    sendAudioBlobDataToServer(new Blob(recordedChunks[chunkInd], { type: "audio/wav" }));
                    recordedChunks[chunkInd] = [];
                }
            };

            if (HaveToStop) { // need to stop recording
                HaveToStop = false;
                return;
            }

            setTimeout(() => { runRecorder(chunkInd^1) }, soundDuration); // ms

            isRecorderStopped[chunkInd] = false;
            isRecorderStopped[chunkInd^1] = true;

            recorders[chunkInd].start();
            recorders[chunkInd^1].stop();
        }

        runRecorder(0);
    }

    function startUsingMicrophone(boolean) {
        getUserMedia({ audio: boolean }).then((stream) => {
            handleMicrophoneOn(stream);
        });
    }
    startUsingMicrophone(true);

    document.getElementById("stopRecording").addEventListener("click", (e) => {
        for (let i = 0; i < 10; i++) { // just to be sure because of async recording
            isRecorderStopped[0] = true;
            isRecorderStopped[1] = true;
            HaveToStop = true;
            recorder.stop();
        }
    });
}

$("#startStreamingButton").click(() => {
    getSound()
});