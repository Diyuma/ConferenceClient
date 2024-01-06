package main

import (
	"context"
	"log"
	"net"
	"testclient/testEasyProtoAndJs/example"

	"google.golang.org/grpc"
)

func (*server) SendMessage(ctx context.Context, req *example.Request) (*example.Response, error) {
	message := req.GetMessage()
	log.Printf("Received message: %s", message)
	reply := "Hello, " + message
	return &example.Response{Reply: reply}, nil
}

type server struct {
	example.UnimplementedExampleServiceServer
}

func main() {
	lis, err := net.Listen("tcp", ":8080")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	s := grpc.NewServer()
	example.RegisterExampleServiceServer(s, &server{})

	log.Println("Server is listening on :8080")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
