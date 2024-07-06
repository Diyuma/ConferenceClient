.ONESHELL:
.SHELLFLAGS += -e
include .bashrc

buildProtos: buildGoProto buildJsProto buildPythonProto

buildGoProto:
	go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2
	export PATH="$PATH:$(go env GOPATH)/bin"
	protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative ./proto/proto.proto

buildPythonProto:
	python -m grpc_tools.protoc -I./proto --python_out=./proto --pyi_out=./proto --grpc_python_out=./proto ./proto/proto.proto

buildJsProto:
	protoc -I=./proto ./proto/proto.proto --js_out=import_style=commonjs:./proto
	protoc -I=./proto ./proto/proto.proto --grpc-web_out=import_style=commonjs,mode=grpcwebtext:./proto

buildFront:
	npm install
	npx webpack ./html/client.js

	rm -r build_html
	mkdir -p build_html/conference

	cp -R ./html/dist build_html/conference/
	cp ./html/index.html build_html/conference/index.html
	cp ./html/dto.js build_html/conference/dist/dto.js
	cp -R ./ssl build_html/

buildFrontServer: buildFront
	scp -i ${SSH_KEY_PATH} -r build_html/* ${VM_USER}@${HOST}:~/conferencev2/html

connectToServer:
	ssh -i ${SSH_KEY_PATH} ${VM_USER}@${HOST}
