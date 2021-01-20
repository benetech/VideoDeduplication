import sys

import inquirer


def confirm(question, default=False, force=False):
    """Confirm operation, exit otherwise"""
    if force:
        return
    confirmed = inquirer.confirm(question, default=default)
    if not confirmed:
        sys.exit(0)
