class BaseObserver:
    """Basic task queue observer, ignores all events by default."""

    def on_task_sent(self, task):
        """Fires when a task message is published."""
        pass

    def on_task_started(self, task):
        """Fires just before the worker executes the task."""
        pass

    def on_task_succeeded(self, task):
        """Fires if the task executed successfully."""
        pass

    def on_task_failed(self, task):
        """Fires if the execution of the task failed."""
        pass

    def on_task_revoked(self, task):
        """Fires if the task has been revoked."""
        pass
