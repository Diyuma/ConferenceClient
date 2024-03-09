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


buildTestGoServer:
	docker build -t lehatr/test_grpc_server .
	docker tag lehatr/test_grpc_server lehatr/test_grpc_server:version2.0
	docker push lehatr/test_grpc_server:version2.0

startTestGoServer:
	docker pull lehatr/test_grpc_server:version2.0
	docker run --publish 9090:8080 -t lehatr/test_grpc_server:version2.0

startEvans:
	evans --proto proto/proto.proto --port 8080

runEnvoy:
	envoy -c envoy-override.yaml

buildFront:
	npm install
	npx webpack ./html/client.js

# !!! npm install
buildFrontServer:
	npx webpack ./html/client.js

	scp -i ~/.ssh/yconference html/dist/main.js html/index.html lehatr@178.154.202.56:~
	ssh -i ~/.ssh/yconference lehatr@178.154.202.56 sudo mv main_sound.js "~/conference/html/conference/dist/main_sound.js"
	ssh -i ~/.ssh/yconference lehatr@178.154.202.56 sudo mv index.html "~/conference/html/conference/index.html"
# ssh -i ~/.ssh/yconference lehatr@178.154.202.56 sudo mv main_video.js "~/conference/html/conference/dist/main_video.js"

buildAndRunAllSound: buildFront buildProtos startEnvoy startTestGoServer

connectToServer:
	ssh -i ~/.ssh/yconference lehatr@178.154.202.56

#ssh -i ~/.ssh/yconference lehatr@178.154.202.56 sudo docker run --name docker-nginx -p 443:443 --network conf_net -d -v /home/lehatr/conference/html:/usr/share/nginx/html \
				-v /home/lehatr/docker-nginx/nginx.conf:/etc/nginx/conf.d/default.conf nginx

# node client.js