import fire

from cli.handlers.root import RootCli

if __name__ == "__main__":
    fire.Fire(RootCli, name="just")
