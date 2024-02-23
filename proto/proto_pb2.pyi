from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class ChatServerMessage(_message.Message):
    __slots__ = ("data", "rate", "soundId")
    DATA_FIELD_NUMBER: _ClassVar[int]
    RATE_FIELD_NUMBER: _ClassVar[int]
    SOUNDID_FIELD_NUMBER: _ClassVar[int]
    data: _containers.RepeatedScalarFieldContainer[float]
    rate: int
    soundId: int
    def __init__(self, data: _Optional[_Iterable[float]] = ..., rate: _Optional[int] = ..., soundId: _Optional[int] = ...) -> None: ...

class ChatClientMessage(_message.Message):
    __slots__ = ("data", "rate", "userId", "confId", "timeStamp", "messageInd")
    DATA_FIELD_NUMBER: _ClassVar[int]
    RATE_FIELD_NUMBER: _ClassVar[int]
    USERID_FIELD_NUMBER: _ClassVar[int]
    CONFID_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    MESSAGEIND_FIELD_NUMBER: _ClassVar[int]
    data: _containers.RepeatedScalarFieldContainer[float]
    rate: int
    userId: int
    confId: int
    timeStamp: int
    messageInd: int
    def __init__(self, data: _Optional[_Iterable[float]] = ..., rate: _Optional[int] = ..., userId: _Optional[int] = ..., confId: _Optional[int] = ..., timeStamp: _Optional[int] = ..., messageInd: _Optional[int] = ...) -> None: ...

class ClientResponseMessage(_message.Message):
    __slots__ = ("rate", "soundId")
    RATE_FIELD_NUMBER: _ClassVar[int]
    SOUNDID_FIELD_NUMBER: _ClassVar[int]
    rate: int
    soundId: int
    def __init__(self, rate: _Optional[int] = ..., soundId: _Optional[int] = ...) -> None: ...

class ClientInfoMessage(_message.Message):
    __slots__ = ("confId", "userId")
    CONFID_FIELD_NUMBER: _ClassVar[int]
    USERID_FIELD_NUMBER: _ClassVar[int]
    confId: int
    userId: int
    def __init__(self, confId: _Optional[int] = ..., userId: _Optional[int] = ...) -> None: ...

class ClientUserInitResponseMessage(_message.Message):
    __slots__ = ("userId",)
    USERID_FIELD_NUMBER: _ClassVar[int]
    userId: int
    def __init__(self, userId: _Optional[int] = ...) -> None: ...

class ClientConfInitResponseMessage(_message.Message):
    __slots__ = ("confId",)
    CONFID_FIELD_NUMBER: _ClassVar[int]
    confId: int
    def __init__(self, confId: _Optional[int] = ...) -> None: ...

class EmptyMessage(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...
