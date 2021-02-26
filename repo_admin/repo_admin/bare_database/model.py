import re
import secrets
from typing import Optional
from urllib.parse import quote

import coolname
from dataclasses import dataclass


@dataclass(frozen=True)
class Role:
    """Database role which represents a repository contributor."""

    # Contributor role name pattern
    NAME_PATTERN = re.compile(r"^[\w][\w_]*$")

    name: str
    password: Optional[str] = None

    @staticmethod
    def is_valid_name(name):
        """Check if the string is a valid role name."""
        return bool(Role.NAME_PATTERN.match(name))

    @staticmethod
    def generate(password_length=40):
        """Generate a random contributor role with strong password."""
        return Role(name="_".join(coolname.generate(2)), password=secrets.token_urlsafe(nbytes=password_length))

    @staticmethod
    def fill(role, password_length=40):
        """Fill missing role fields."""
        if role is None:
            return Role.generate(password_length)
        if role.name is None or role.password is None:
            generated = Role.generate(password_length)
            return Role(name=role.name or generated.name, password=role.password or generated.password)
        return role

    def validate(self):
        """Validate role."""
        if self.name is None:
            return "Role must have a valid name"
        if not self.is_valid_name(self.name):
            return f"Invalid role name: '{self.name}'"

    def ensure_valid(self):
        """Raise ValueError if role is invalid."""
        error = self.validate()
        if error is not None:
            raise ValueError(error)


@dataclass
class Repository:
    """Managed bare-database repository."""

    # Repository valid name pattern
    NAME_PATTERN = re.compile(r"^[\w][\w-]*$")

    name: str
    host: str
    port: int
    database: str
    username: str
    password: Optional[str] = None

    @staticmethod
    def is_valid_name(name):
        """Check valid repo name."""
        return bool(Repository.NAME_PATTERN.match(name))

    def validate(self):
        """Validate repository."""
        if not self.port:
            return "Repository must have a port"
        if not self.is_valid_name(self.name):
            return f"Invalid repository name: '{self.name}'"
        if not self.host:
            return "Repository must have a host name / address"
        if not self.database:
            return "Repository must have a database name."

    def ensure_valid(self):
        """Raise ValueError if repository is invalid."""
        error = self.validate()
        if error is not None:
            raise ValueError(error)

    @property
    def uri(self):
        """Get repository URI."""
        password = self.password or ""
        credentials = f"{quote(self.username, safe='')}:{quote(password, safe='')}"
        network_address = f"{quote(self.host, safe='')}:{quote(str(self.port), safe='')}"
        return f"postgresql://{credentials}@{network_address}/{quote(self.database)}"
