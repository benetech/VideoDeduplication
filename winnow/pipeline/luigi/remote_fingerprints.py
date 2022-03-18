import luigi
from cached_property import cached_property

from remote import make_client
from remote.connect import RemoteConnector
from winnow.pipeline.luigi.platform import PipelineTask, CheckTarget


class PushFingerprintsTask(PipelineTask):
    """Push fingerprints to the remote repository."""

    repository_name: str = luigi.Parameter()

    def output(self):
        return CheckTarget(should_execute=self.connector.push_available)

    def run(self):
        self.logger.info("Pushing fingerprints to %s", self.repository_name)
        try:
            self.connector.push_all(chunk_size=10000, progress=self.progress)
            self.logger.info("Finished pushing fingerprints to %s", self.repository_name)
        except Exception:
            self.logger.exception("Error pushing fingerprints to %s", self.repository_name)
            raise
        finally:
            # Update repo metadata
            self.logger.info("Updating '%s' repository metadata", self.repository_name)
            repo = self.pipeline.repository_dao.get(self.repository_name)
            client = make_client(repo)
            repo_stats = client.get_stats()
            self.pipeline.repository_dao.update_stats(repo_stats)

    @cached_property
    def connector(self) -> RemoteConnector:
        repo = self.pipeline.repository_dao.get(self.repository_name)
        return self.pipeline.make_connector(repo)


class PullFingerprintsTask(PipelineTask):
    """Pull fingerprints from the remote repository."""

    repository_name: str = luigi.Parameter()

    def output(self):
        return CheckTarget(should_execute=self.connector.pull_available)

    def run(self):
        self.logger.info("Pulling fingerprints from %s", self.repository_name)
        try:
            self.connector.pull_all(chunk_size=10000, progress=self.progress)
            self.logger.info("Finished pulling fingerprints from %s", self.repository_name)
        except Exception:
            self.logger.exception("Error pulling fingerprints from %s", self.repository_name)
            raise
        finally:
            # Update repo metadata
            self.logger.info("Updating '%s' repository metadata", self.repository_name)
            repo = self.pipeline.repository_dao.get(self.repository_name)
            client = make_client(repo)
            repo_stats = client.get_stats()
            self.pipeline.repository_dao.update_stats(repo_stats)

    @cached_property
    def connector(self) -> RemoteConnector:
        repo = self.pipeline.repository_dao.get(self.repository_name)
        return self.pipeline.make_connector(repo)
