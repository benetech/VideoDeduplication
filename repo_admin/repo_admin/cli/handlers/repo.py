from typing import Optional

from repo_admin.bare_database.credentials import RepoStorage
from repo_admin.cli.platform.arguments import get_database_url
from repo_admin.cli.platform.error import handle_errors, CliError


class RepoCliHandler:
    """Repository credentials management."""

    @handle_errors
    def list(self):
        """List saved repositories."""
        repo_storage = RepoStorage()
        for repo in repo_storage.list_repos():
            print(repo)

    @handle_errors
    def add(
        self,
        repo_name: str,
        host: str,
        port: int,
        dbname: str,
        user: str = "postgres",
        password: Optional[str] = None,
    ):
        """Save repository credentials."""
        database_url = get_database_url(host=host, port=port, dbname=dbname, user=user, password=password)
        repo_storage = RepoStorage()
        repo_storage.save_repo(repo_name=repo_name, connection_url=database_url)
        print(f"Repository '{repo_name}' successfully saved.")

    @handle_errors
    def delete(self, repo_name: str):
        """Remove repository."""
        repo_storage = RepoStorage()
        if not repo_storage.exists(repo_name):
            raise CliError(f"Repository doesnt exist: {repo_name}")
        repo_storage.delete_repo(repo_name)
