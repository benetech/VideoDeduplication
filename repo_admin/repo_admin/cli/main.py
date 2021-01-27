import fire

from repo_admin.cli.handlers.root import RootHandler


def main():
    """Execute repo-admin command-line interface."""
    fire.Fire(RootHandler, name="repo-admin")


if __name__ == "__main__":
    main()
