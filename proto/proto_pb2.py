# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: proto.proto
# Protobuf Python Version: 4.25.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0bproto.proto\x12\nprotoSound\"F\n\x11\x43hatServerMessage\x12\x0c\n\x04\x64\x61ta\x18\x03 \x03(\x02\x12\x0c\n\x04rate\x18\x02 \x01(\x03\x12\x0f\n\x07soundId\x18\x04 \x01(\x04J\x04\x08\x01\x10\x02\"\x88\x01\n\x11\x43hatClientMessage\x12\x0c\n\x04\x64\x61ta\x18\x04 \x03(\x02\x12\x0c\n\x04rate\x18\x02 \x01(\x03\x12\x0e\n\x06userId\x18\x06 \x01(\r\x12\x0e\n\x06\x63onfId\x18\x07 \x01(\x04\x12\x11\n\ttimeStamp\x18\x08 \x01(\x04\x12\x12\n\nmessageInd\x18\t \x01(\rJ\x04\x08\x01\x10\x02J\x04\x08\x03\x10\x04J\x04\x08\x05\x10\x06\"6\n\x15\x43lientResponseMessage\x12\x0c\n\x04rate\x18\x01 \x01(\x03\x12\x0f\n\x07soundId\x18\x02 \x01(\x04\"3\n\x11\x43lientInfoMessage\x12\x0e\n\x06\x63onfId\x18\x01 \x01(\x04\x12\x0e\n\x06userId\x18\x02 \x01(\x04\"/\n\x1d\x43lientUserInitResponseMessage\x12\x0e\n\x06userId\x18\x01 \x01(\r\"/\n\x1d\x43lientConfInitResponseMessage\x12\x0e\n\x06\x63onfId\x18\x01 \x01(\x04\"\x0e\n\x0c\x45mptyMessage2\xcb\x02\n\x0cSoundService\x12J\n\x08GetSound\x12\x1d.protoSound.ClientInfoMessage\x1a\x1d.protoSound.ChatServerMessage0\x01\x12M\n\tSendSound\x12\x1d.protoSound.ChatClientMessage\x1a!.protoSound.ClientResponseMessage\x12O\n\x08InitUser\x12\x18.protoSound.EmptyMessage\x1a).protoSound.ClientUserInitResponseMessage\x12O\n\x08InitConf\x12\x18.protoSound.EmptyMessage\x1a).protoSound.ClientConfInitResponseMessageB\nZ\x08./;protob\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'proto_pb2', _globals)
if _descriptor._USE_C_DESCRIPTORS == False:
  _globals['DESCRIPTOR']._options = None
  _globals['DESCRIPTOR']._serialized_options = b'Z\010./;proto'
  _globals['_CHATSERVERMESSAGE']._serialized_start=27
  _globals['_CHATSERVERMESSAGE']._serialized_end=97
  _globals['_CHATCLIENTMESSAGE']._serialized_start=100
  _globals['_CHATCLIENTMESSAGE']._serialized_end=236
  _globals['_CLIENTRESPONSEMESSAGE']._serialized_start=238
  _globals['_CLIENTRESPONSEMESSAGE']._serialized_end=292
  _globals['_CLIENTINFOMESSAGE']._serialized_start=294
  _globals['_CLIENTINFOMESSAGE']._serialized_end=345
  _globals['_CLIENTUSERINITRESPONSEMESSAGE']._serialized_start=347
  _globals['_CLIENTUSERINITRESPONSEMESSAGE']._serialized_end=394
  _globals['_CLIENTCONFINITRESPONSEMESSAGE']._serialized_start=396
  _globals['_CLIENTCONFINITRESPONSEMESSAGE']._serialized_end=443
  _globals['_EMPTYMESSAGE']._serialized_start=445
  _globals['_EMPTYMESSAGE']._serialized_end=459
  _globals['_SOUNDSERVICE']._serialized_start=462
  _globals['_SOUNDSERVICE']._serialized_end=793
# @@protoc_insertion_point(module_scope)
