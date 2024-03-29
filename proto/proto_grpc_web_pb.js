/**
 * @fileoverview gRPC-Web generated client stub for protoSound
 * @enhanceable
 * @public
 */

// Code generated by protoc-gen-grpc-web. DO NOT EDIT.
// versions:
// 	protoc-gen-grpc-web v1.5.0
// 	protoc              v3.20.3
// source: proto.proto


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.protoSound = require('./proto_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.protoSound.SoundServiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname.replace(/\/+$/, '');

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.protoSound.SoundServicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname.replace(/\/+$/, '');

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.protoSound.ClientInfoMessage,
 *   !proto.protoSound.ChatServerMessage>}
 */
const methodDescriptor_SoundService_GetSound = new grpc.web.MethodDescriptor(
  '/protoSound.SoundService/GetSound',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.protoSound.ClientInfoMessage,
  proto.protoSound.ChatServerMessage,
  /**
   * @param {!proto.protoSound.ClientInfoMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.protoSound.ChatServerMessage.deserializeBinary
);


/**
 * @param {!proto.protoSound.ClientInfoMessage} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.protoSound.ChatServerMessage>}
 *     The XHR Node Readable Stream
 */
proto.protoSound.SoundServiceClient.prototype.getSound =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/protoSound.SoundService/GetSound',
      request,
      metadata || {},
      methodDescriptor_SoundService_GetSound);
};


/**
 * @param {!proto.protoSound.ClientInfoMessage} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.protoSound.ChatServerMessage>}
 *     The XHR Node Readable Stream
 */
proto.protoSound.SoundServicePromiseClient.prototype.getSound =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/protoSound.SoundService/GetSound',
      request,
      metadata || {},
      methodDescriptor_SoundService_GetSound);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.protoSound.ChatClientMessage,
 *   !proto.protoSound.ClientResponseMessage>}
 */
const methodDescriptor_SoundService_SendSound = new grpc.web.MethodDescriptor(
  '/protoSound.SoundService/SendSound',
  grpc.web.MethodType.UNARY,
  proto.protoSound.ChatClientMessage,
  proto.protoSound.ClientResponseMessage,
  /**
   * @param {!proto.protoSound.ChatClientMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.protoSound.ClientResponseMessage.deserializeBinary
);


/**
 * @param {!proto.protoSound.ChatClientMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.protoSound.ClientResponseMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.protoSound.ClientResponseMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.protoSound.SoundServiceClient.prototype.sendSound =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/protoSound.SoundService/SendSound',
      request,
      metadata || {},
      methodDescriptor_SoundService_SendSound,
      callback);
};


/**
 * @param {!proto.protoSound.ChatClientMessage} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.protoSound.ClientResponseMessage>}
 *     Promise that resolves to the response
 */
proto.protoSound.SoundServicePromiseClient.prototype.sendSound =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/protoSound.SoundService/SendSound',
      request,
      metadata || {},
      methodDescriptor_SoundService_SendSound);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.protoSound.ClientInfoMessage,
 *   !proto.protoSound.EmptyMessage>}
 */
const methodDescriptor_SoundService_PingServer = new grpc.web.MethodDescriptor(
  '/protoSound.SoundService/PingServer',
  grpc.web.MethodType.UNARY,
  proto.protoSound.ClientInfoMessage,
  proto.protoSound.EmptyMessage,
  /**
   * @param {!proto.protoSound.ClientInfoMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.protoSound.EmptyMessage.deserializeBinary
);


/**
 * @param {!proto.protoSound.ClientInfoMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.protoSound.EmptyMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.protoSound.EmptyMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.protoSound.SoundServiceClient.prototype.pingServer =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/protoSound.SoundService/PingServer',
      request,
      metadata || {},
      methodDescriptor_SoundService_PingServer,
      callback);
};


/**
 * @param {!proto.protoSound.ClientInfoMessage} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.protoSound.EmptyMessage>}
 *     Promise that resolves to the response
 */
proto.protoSound.SoundServicePromiseClient.prototype.pingServer =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/protoSound.SoundService/PingServer',
      request,
      metadata || {},
      methodDescriptor_SoundService_PingServer);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.protoSound.EmptyMessage,
 *   !proto.protoSound.ClientUserInitResponseMessage>}
 */
const methodDescriptor_SoundService_InitUser = new grpc.web.MethodDescriptor(
  '/protoSound.SoundService/InitUser',
  grpc.web.MethodType.UNARY,
  proto.protoSound.EmptyMessage,
  proto.protoSound.ClientUserInitResponseMessage,
  /**
   * @param {!proto.protoSound.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.protoSound.ClientUserInitResponseMessage.deserializeBinary
);


/**
 * @param {!proto.protoSound.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.protoSound.ClientUserInitResponseMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.protoSound.ClientUserInitResponseMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.protoSound.SoundServiceClient.prototype.initUser =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/protoSound.SoundService/InitUser',
      request,
      metadata || {},
      methodDescriptor_SoundService_InitUser,
      callback);
};


/**
 * @param {!proto.protoSound.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.protoSound.ClientUserInitResponseMessage>}
 *     Promise that resolves to the response
 */
proto.protoSound.SoundServicePromiseClient.prototype.initUser =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/protoSound.SoundService/InitUser',
      request,
      metadata || {},
      methodDescriptor_SoundService_InitUser);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.protoSound.EmptyMessage,
 *   !proto.protoSound.ClientConfInitResponseMessage>}
 */
const methodDescriptor_SoundService_InitConf = new grpc.web.MethodDescriptor(
  '/protoSound.SoundService/InitConf',
  grpc.web.MethodType.UNARY,
  proto.protoSound.EmptyMessage,
  proto.protoSound.ClientConfInitResponseMessage,
  /**
   * @param {!proto.protoSound.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.protoSound.ClientConfInitResponseMessage.deserializeBinary
);


/**
 * @param {!proto.protoSound.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.protoSound.ClientConfInitResponseMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.protoSound.ClientConfInitResponseMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.protoSound.SoundServiceClient.prototype.initConf =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/protoSound.SoundService/InitConf',
      request,
      metadata || {},
      methodDescriptor_SoundService_InitConf,
      callback);
};


/**
 * @param {!proto.protoSound.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.protoSound.ClientConfInitResponseMessage>}
 *     Promise that resolves to the response
 */
proto.protoSound.SoundServicePromiseClient.prototype.initConf =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/protoSound.SoundService/InitConf',
      request,
      metadata || {},
      methodDescriptor_SoundService_InitConf);
};


module.exports = proto.protoSound;

