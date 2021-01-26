from termcolor import colored


def highlight(text, substring):
    """Highlight all occurances of the substring in the text."""
    if substring is None or len(substring) == 0:
        return text
    return text.replace(substring, colored(substring, "yellow"))


def warn(text):
    """Decorate console warning text."""
    return colored(text, "yellow")


def error(text):
    """Decorate console error text."""
    return colored(text, "red")


def ok(text):
    """Decorate console success text."""
    return colored(text, "green")


def bold(text):
    """Make text bold in console."""
    return colored(text, attrs=("bold",))
