import fire

from repo_admin.cli.handlers.root import RootCliHandler


def main():
    """Execute repo-admin command-line interface."""
    fire.Fire(RootCliHandler, name="repo-admin")


if __name__ == "__main__":
    main()
