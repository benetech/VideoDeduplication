# RPC Server

Remote Procedure Call server is required to call machine-learning algorithms from
other services (e.g. from REST API server).

## Running Server

To run the rpc-server execute the following command:
```shell
python -m rpc.server
```

Recognized environment variables:
 * `RPC_SERVER_HOST` - server host name
 * `RPC_SERVER_PORT` - server port
 * `RPC_SERVER_EAGER_INITIALIZE` - if defined the server will initialize video-index on startup (by default video-index is initialized on the first request)

## Development

To generate `rpc_pb2.py` (protocol implementation) and `rpc_pb2_grpc.py` (gRPC logic) 
run the following command from the repository root:
```shell
python -m grpc_tools.protoc -I . --python_out=. --grpc_python_out=. rpc/rpc.proto
```
