/**
 * @fileoverview gRPC-Web generated client stub for proto
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
proto.proto = require('./proto_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.proto.SoundServiceClient =
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
proto.proto.SoundServicePromiseClient =
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
 *   !proto.proto.ClientInfoMessage,
 *   !proto.proto.ChatServerMessage>}
 */
const methodDescriptor_SoundService_GetSound = new grpc.web.MethodDescriptor(
  '/proto.SoundService/GetSound',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.proto.ClientInfoMessage,
  proto.proto.ChatServerMessage,
  /**
   * @param {!proto.proto.ClientInfoMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.proto.ChatServerMessage.deserializeBinary
);


/**
 * @param {!proto.proto.ClientInfoMessage} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.proto.ChatServerMessage>}
 *     The XHR Node Readable Stream
 */
proto.proto.SoundServiceClient.prototype.getSound =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/proto.SoundService/GetSound',
      request,
      metadata || {},
      methodDescriptor_SoundService_GetSound);
};


/**
 * @param {!proto.proto.ClientInfoMessage} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.proto.ChatServerMessage>}
 *     The XHR Node Readable Stream
 */
proto.proto.SoundServicePromiseClient.prototype.getSound =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/proto.SoundService/GetSound',
      request,
      metadata || {},
      methodDescriptor_SoundService_GetSound);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.proto.ChatClientMessage,
 *   !proto.proto.ClientResponseMessage>}
 */
const methodDescriptor_SoundService_SendSound = new grpc.web.MethodDescriptor(
  '/proto.SoundService/SendSound',
  grpc.web.MethodType.UNARY,
  proto.proto.ChatClientMessage,
  proto.proto.ClientResponseMessage,
  /**
   * @param {!proto.proto.ChatClientMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.proto.ClientResponseMessage.deserializeBinary
);


/**
 * @param {!proto.proto.ChatClientMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.proto.ClientResponseMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.proto.ClientResponseMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.proto.SoundServiceClient.prototype.sendSound =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/proto.SoundService/SendSound',
      request,
      metadata || {},
      methodDescriptor_SoundService_SendSound,
      callback);
};


/**
 * @param {!proto.proto.ChatClientMessage} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.proto.ClientResponseMessage>}
 *     Promise that resolves to the response
 */
proto.proto.SoundServicePromiseClient.prototype.sendSound =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/proto.SoundService/SendSound',
      request,
      metadata || {},
      methodDescriptor_SoundService_SendSound);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.proto.EmptyMessage,
 *   !proto.proto.ClientUserInitResponseMessage>}
 */
const methodDescriptor_SoundService_InitUser = new grpc.web.MethodDescriptor(
  '/proto.SoundService/InitUser',
  grpc.web.MethodType.UNARY,
  proto.proto.EmptyMessage,
  proto.proto.ClientUserInitResponseMessage,
  /**
   * @param {!proto.proto.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.proto.ClientUserInitResponseMessage.deserializeBinary
);


/**
 * @param {!proto.proto.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.proto.ClientUserInitResponseMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.proto.ClientUserInitResponseMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.proto.SoundServiceClient.prototype.initUser =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/proto.SoundService/InitUser',
      request,
      metadata || {},
      methodDescriptor_SoundService_InitUser,
      callback);
};


/**
 * @param {!proto.proto.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.proto.ClientUserInitResponseMessage>}
 *     Promise that resolves to the response
 */
proto.proto.SoundServicePromiseClient.prototype.initUser =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/proto.SoundService/InitUser',
      request,
      metadata || {},
      methodDescriptor_SoundService_InitUser);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.proto.EmptyMessage,
 *   !proto.proto.ClientConfInitResponseMessage>}
 */
const methodDescriptor_SoundService_InitConf = new grpc.web.MethodDescriptor(
  '/proto.SoundService/InitConf',
  grpc.web.MethodType.UNARY,
  proto.proto.EmptyMessage,
  proto.proto.ClientConfInitResponseMessage,
  /**
   * @param {!proto.proto.EmptyMessage} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.proto.ClientConfInitResponseMessage.deserializeBinary
);


/**
 * @param {!proto.proto.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.proto.ClientConfInitResponseMessage)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.proto.ClientConfInitResponseMessage>|undefined}
 *     The XHR Node Readable Stream
 */
proto.proto.SoundServiceClient.prototype.initConf =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/proto.SoundService/InitConf',
      request,
      metadata || {},
      methodDescriptor_SoundService_InitConf,
      callback);
};


/**
 * @param {!proto.proto.EmptyMessage} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.proto.ClientConfInitResponseMessage>}
 *     Promise that resolves to the response
 */
proto.proto.SoundServicePromiseClient.prototype.initConf =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/proto.SoundService/InitConf',
      request,
      metadata || {},
      methodDescriptor_SoundService_InitConf);
};


module.exports = proto.proto;

