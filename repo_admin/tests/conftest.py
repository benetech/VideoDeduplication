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
    parser.addoption(
        "--database_uri",
        action="store",
        dest="database_uri",
        default=None,
        help="Repository database URI",
    )


def pytest_configure(config):
    """Configure test suite.

    See https://docs.pytest.org/en/stable/reference.html#pytest.hookspec.pytest_configure
    """
    if not config.option.integration:
        setattr(config.option, "markexpr", "not integration")


def pytest_generate_tests(metafunc):
    """Make sure command-line params are passed correctly to test functions.

    See https://docs.pytest.org/en/stable/reference.html#pytest.hookspec.pytest_generate_tests
    See https://docs.pytest.org/en/stable/reference.html#metafunc
    """
    database_uri = metafunc.config.option.database_uri
    if "database_uri" in metafunc.fixturenames and database_uri is not None:
        metafunc.parametrize("database_uri", [database_uri])


# Decorator for integration tests
integration = pytest.mark.integration
