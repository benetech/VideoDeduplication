import pytest


def pytest_addoption(parser):
    """Add command-line options for pytest.

    See https://docs.pytest.org/en/stable/example/parametrize.html
    """
    parser.addoption(
        "--integration",
        action="store_true",
        dest="integration",
        default=False,
        help="Enable integration tests",
    )


def pytest_configure(config):
    """Configure test suite.

    See https://docs.pytest.org/en/stable/reference.html#pytest.hookspec.pytest_configure
    """
    if not config.option.integration:
        setattr(config.option, "markexpr", "not integration")


# Decorator for integration tests
integration = pytest.mark.integration
