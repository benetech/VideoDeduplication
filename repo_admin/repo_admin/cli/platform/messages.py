from termcolor import colored


def warn(text):
    """Print a warning to stdout."""
    print(colored("WARNING:", "yellow", attrs=("bold",)), colored(text))
