package main

import (
	"io"
	"log"
	"net"
	"testclient/testStreamProtoAndJs/example"

	"google.golang.org/grpc"
)

func (s *server) SendMessage(stream example.ExampleService_SendMessageServer) error {
	for {
		in, err := stream.Recv()
		if err == io.EOF {
			return nil // End of stream
		}
		if err != nil {
			log.Fatalf("Failed to receive a message : %v", err)
			return err
		}

		log.Printf("Received message: %s", in.GetMessage())
		if err := stream.Send(&example.Response{Reply: in.GetMessage()}); err != nil { // Echo the received message back to the client
			log.Fatalf("Failed to send a message: %v", err)
			return err
		}
	}
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
