// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.20.3
// source: proto/proto.proto

package proto

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// SoundServiceClient is the client API for SoundService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type SoundServiceClient interface {
	GetSoundJustHello(ctx context.Context, in *ChatClientMessage, opts ...grpc.CallOption) (SoundService_GetSoundJustHelloClient, error)
	GetSound(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (SoundService_GetSoundClient, error)
	SendSound(ctx context.Context, in *ChatClientMessage, opts ...grpc.CallOption) (*EmptyMessage, error)
}

type soundServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewSoundServiceClient(cc grpc.ClientConnInterface) SoundServiceClient {
	return &soundServiceClient{cc}
}

func (c *soundServiceClient) GetSoundJustHello(ctx context.Context, in *ChatClientMessage, opts ...grpc.CallOption) (SoundService_GetSoundJustHelloClient, error) {
	stream, err := c.cc.NewStream(ctx, &SoundService_ServiceDesc.Streams[0], "/proto.SoundService/GetSoundJustHello", opts...)
	if err != nil {
		return nil, err
	}
	x := &soundServiceGetSoundJustHelloClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type SoundService_GetSoundJustHelloClient interface {
	Recv() (*ChatServerMessage, error)
	grpc.ClientStream
}

type soundServiceGetSoundJustHelloClient struct {
	grpc.ClientStream
}

func (x *soundServiceGetSoundJustHelloClient) Recv() (*ChatServerMessage, error) {
	m := new(ChatServerMessage)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *soundServiceClient) GetSound(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (SoundService_GetSoundClient, error) {
	stream, err := c.cc.NewStream(ctx, &SoundService_ServiceDesc.Streams[1], "/proto.SoundService/GetSound", opts...)
	if err != nil {
		return nil, err
	}
	x := &soundServiceGetSoundClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type SoundService_GetSoundClient interface {
	Recv() (*ChatServerMessage, error)
	grpc.ClientStream
}

type soundServiceGetSoundClient struct {
	grpc.ClientStream
}

func (x *soundServiceGetSoundClient) Recv() (*ChatServerMessage, error) {
	m := new(ChatServerMessage)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *soundServiceClient) SendSound(ctx context.Context, in *ChatClientMessage, opts ...grpc.CallOption) (*EmptyMessage, error) {
	out := new(EmptyMessage)
	err := c.cc.Invoke(ctx, "/proto.SoundService/SendSound", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// SoundServiceServer is the server API for SoundService service.
// All implementations must embed UnimplementedSoundServiceServer
// for forward compatibility
type SoundServiceServer interface {
	GetSoundJustHello(*ChatClientMessage, SoundService_GetSoundJustHelloServer) error
	GetSound(*EmptyMessage, SoundService_GetSoundServer) error
	SendSound(context.Context, *ChatClientMessage) (*EmptyMessage, error)
	mustEmbedUnimplementedSoundServiceServer()
}

// UnimplementedSoundServiceServer must be embedded to have forward compatible implementations.
type UnimplementedSoundServiceServer struct {
}

func (UnimplementedSoundServiceServer) GetSoundJustHello(*ChatClientMessage, SoundService_GetSoundJustHelloServer) error {
	return status.Errorf(codes.Unimplemented, "method GetSoundJustHello not implemented")
}
func (UnimplementedSoundServiceServer) GetSound(*EmptyMessage, SoundService_GetSoundServer) error {
	return status.Errorf(codes.Unimplemented, "method GetSound not implemented")
}
func (UnimplementedSoundServiceServer) SendSound(context.Context, *ChatClientMessage) (*EmptyMessage, error) {
	return nil, status.Errorf(codes.Unimplemented, "method SendSound not implemented")
}
func (UnimplementedSoundServiceServer) mustEmbedUnimplementedSoundServiceServer() {}

// UnsafeSoundServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to SoundServiceServer will
// result in compilation errors.
type UnsafeSoundServiceServer interface {
	mustEmbedUnimplementedSoundServiceServer()
}

func RegisterSoundServiceServer(s grpc.ServiceRegistrar, srv SoundServiceServer) {
	s.RegisterService(&SoundService_ServiceDesc, srv)
}

func _SoundService_GetSoundJustHello_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(ChatClientMessage)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(SoundServiceServer).GetSoundJustHello(m, &soundServiceGetSoundJustHelloServer{stream})
}

type SoundService_GetSoundJustHelloServer interface {
	Send(*ChatServerMessage) error
	grpc.ServerStream
}

type soundServiceGetSoundJustHelloServer struct {
	grpc.ServerStream
}

func (x *soundServiceGetSoundJustHelloServer) Send(m *ChatServerMessage) error {
	return x.ServerStream.SendMsg(m)
}

func _SoundService_GetSound_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(EmptyMessage)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(SoundServiceServer).GetSound(m, &soundServiceGetSoundServer{stream})
}

type SoundService_GetSoundServer interface {
	Send(*ChatServerMessage) error
	grpc.ServerStream
}

type soundServiceGetSoundServer struct {
	grpc.ServerStream
}

func (x *soundServiceGetSoundServer) Send(m *ChatServerMessage) error {
	return x.ServerStream.SendMsg(m)
}

func _SoundService_SendSound_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ChatClientMessage)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(SoundServiceServer).SendSound(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/proto.SoundService/SendSound",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(SoundServiceServer).SendSound(ctx, req.(*ChatClientMessage))
	}
	return interceptor(ctx, in, info, handler)
}

// SoundService_ServiceDesc is the grpc.ServiceDesc for SoundService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var SoundService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "proto.SoundService",
	HandlerType: (*SoundServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "SendSound",
			Handler:    _SoundService_SendSound_Handler,
		},
	},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "GetSoundJustHello",
			Handler:       _SoundService_GetSoundJustHello_Handler,
			ServerStreams: true,
		},
		{
			StreamName:    "GetSound",
			Handler:       _SoundService_GetSound_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "proto/proto.proto",
}