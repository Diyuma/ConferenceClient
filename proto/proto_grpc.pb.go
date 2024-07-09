// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.20.3
// source: proto/proto.proto

package protosound

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
	GetSound(ctx context.Context, in *ClientInfoMessage, opts ...grpc.CallOption) (SoundService_GetSoundClient, error)
	SendSound(ctx context.Context, in *ChatClientMessage, opts ...grpc.CallOption) (*ClientResponseMessage, error)
	PingServer(ctx context.Context, in *ClientInfoMessage, opts ...grpc.CallOption) (*EmptyMessage, error)
	InitUser(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (*ClientUserInitResponseMessage, error)
	InitConf(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (*ClientConfInitResponseMessage, error)
}

type soundServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewSoundServiceClient(cc grpc.ClientConnInterface) SoundServiceClient {
	return &soundServiceClient{cc}
}

func (c *soundServiceClient) GetSound(ctx context.Context, in *ClientInfoMessage, opts ...grpc.CallOption) (SoundService_GetSoundClient, error) {
	stream, err := c.cc.NewStream(ctx, &SoundService_ServiceDesc.Streams[0], "/protosound.SoundService/GetSound", opts...)
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

func (c *soundServiceClient) SendSound(ctx context.Context, in *ChatClientMessage, opts ...grpc.CallOption) (*ClientResponseMessage, error) {
	out := new(ClientResponseMessage)
	err := c.cc.Invoke(ctx, "/protosound.SoundService/SendSound", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *soundServiceClient) PingServer(ctx context.Context, in *ClientInfoMessage, opts ...grpc.CallOption) (*EmptyMessage, error) {
	out := new(EmptyMessage)
	err := c.cc.Invoke(ctx, "/protosound.SoundService/PingServer", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *soundServiceClient) InitUser(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (*ClientUserInitResponseMessage, error) {
	out := new(ClientUserInitResponseMessage)
	err := c.cc.Invoke(ctx, "/protosound.SoundService/InitUser", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *soundServiceClient) InitConf(ctx context.Context, in *EmptyMessage, opts ...grpc.CallOption) (*ClientConfInitResponseMessage, error) {
	out := new(ClientConfInitResponseMessage)
	err := c.cc.Invoke(ctx, "/protosound.SoundService/InitConf", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// SoundServiceServer is the server API for SoundService service.
// All implementations must embed UnimplementedSoundServiceServer
// for forward compatibility
type SoundServiceServer interface {
	GetSound(*ClientInfoMessage, SoundService_GetSoundServer) error
	SendSound(context.Context, *ChatClientMessage) (*ClientResponseMessage, error)
	PingServer(context.Context, *ClientInfoMessage) (*EmptyMessage, error)
	InitUser(context.Context, *EmptyMessage) (*ClientUserInitResponseMessage, error)
	InitConf(context.Context, *EmptyMessage) (*ClientConfInitResponseMessage, error)
	mustEmbedUnimplementedSoundServiceServer()
}

// UnimplementedSoundServiceServer must be embedded to have forward compatible implementations.
type UnimplementedSoundServiceServer struct {
}

func (UnimplementedSoundServiceServer) GetSound(*ClientInfoMessage, SoundService_GetSoundServer) error {
	return status.Errorf(codes.Unimplemented, "method GetSound not implemented")
}
func (UnimplementedSoundServiceServer) SendSound(context.Context, *ChatClientMessage) (*ClientResponseMessage, error) {
	return nil, status.Errorf(codes.Unimplemented, "method SendSound not implemented")
}
func (UnimplementedSoundServiceServer) PingServer(context.Context, *ClientInfoMessage) (*EmptyMessage, error) {
	return nil, status.Errorf(codes.Unimplemented, "method PingServer not implemented")
}
func (UnimplementedSoundServiceServer) InitUser(context.Context, *EmptyMessage) (*ClientUserInitResponseMessage, error) {
	return nil, status.Errorf(codes.Unimplemented, "method InitUser not implemented")
}
func (UnimplementedSoundServiceServer) InitConf(context.Context, *EmptyMessage) (*ClientConfInitResponseMessage, error) {
	return nil, status.Errorf(codes.Unimplemented, "method InitConf not implemented")
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

func _SoundService_GetSound_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(ClientInfoMessage)
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
		FullMethod: "/protosound.SoundService/SendSound",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(SoundServiceServer).SendSound(ctx, req.(*ChatClientMessage))
	}
	return interceptor(ctx, in, info, handler)
}

func _SoundService_PingServer_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(ClientInfoMessage)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(SoundServiceServer).PingServer(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/protosound.SoundService/PingServer",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(SoundServiceServer).PingServer(ctx, req.(*ClientInfoMessage))
	}
	return interceptor(ctx, in, info, handler)
}

func _SoundService_InitUser_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(EmptyMessage)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(SoundServiceServer).InitUser(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/protosound.SoundService/InitUser",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(SoundServiceServer).InitUser(ctx, req.(*EmptyMessage))
	}
	return interceptor(ctx, in, info, handler)
}

func _SoundService_InitConf_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(EmptyMessage)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(SoundServiceServer).InitConf(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/protosound.SoundService/InitConf",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(SoundServiceServer).InitConf(ctx, req.(*EmptyMessage))
	}
	return interceptor(ctx, in, info, handler)
}

// SoundService_ServiceDesc is the grpc.ServiceDesc for SoundService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var SoundService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "protosound.SoundService",
	HandlerType: (*SoundServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "SendSound",
			Handler:    _SoundService_SendSound_Handler,
		},
		{
			MethodName: "PingServer",
			Handler:    _SoundService_PingServer_Handler,
		},
		{
			MethodName: "InitUser",
			Handler:    _SoundService_InitUser_Handler,
		},
		{
			MethodName: "InitConf",
			Handler:    _SoundService_InitConf_Handler,
		},
	},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "GetSound",
			Handler:       _SoundService_GetSound_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "proto/proto.proto",
}
