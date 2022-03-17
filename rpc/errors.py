import grpc


class ServiceUnavailable(Exception):
    """Service unavailable error."""


def unavailable(
    context: grpc.ServicerContext,
    message: str = "Service is temporary unavailable",
) -> ServiceUnavailable:
    """Construct exception and setup error details in gRPC context."""
    context.set_code(grpc.StatusCode.UNAVAILABLE)
    context.set_details(message)
    return ServiceUnavailable(message)
