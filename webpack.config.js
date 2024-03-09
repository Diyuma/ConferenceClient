const path = require('path');

module.exports = {
    entry: ['./proto/proto_grpc_web_pb.js', './proto/proto_pb.js'],
    output: {
    filename: 'main_sound.js',
        path: path.resolve(__dirname, 'html/dist'),
    },
    resolve: {
        fallback: {
        "fs": false,
        "tls": false,
        "net": false,
        "path": false,
        "zlib": false,
        "http": false,
        "https": false,
        "stream": false,
        "crypto": false,
        "crypto-browserify": require.resolve('crypto-browserify')
        }
    },
};