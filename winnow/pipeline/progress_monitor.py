import abc


class BaseProgressMonitor(abc.ABC):
    @abc.abstractmethod
    def scale(self, total_work):
        """Change total amount of work."""

    @abc.abstractmethod
    def update(self, work_done):
        """Update current amount of work done."""

    @abc.abstractmethod
    def complete(self):
        """Mark the task as completed."""

    @abc.abstractmethod
    def increase(self, amount):
        """Increment amount of work done by the specified value."""

    @abc.abstractmethod
    def subtask(self, work_amount):
        """Create a subtask corresponding to the specified amount of work."""

    @property
    @abc.abstractmethod
    def progress(self):
        """Get current progress [0.0, 1.0]"""


class _NullProgressMonitor(BaseProgressMonitor):
    """A NoOp implementation of progress monitor."""

    def scale(self, total_work):
        pass

    def update(self, work_done):
        pass

    def complete(self):
        pass

    def increase(self, amount):
        pass

    def subtask(self, work_amount):
        return self

    @property
    def progress(self):
        return 0.0


class ProgressMonitor(BaseProgressMonitor):
    NULL = _NullProgressMonitor()

    def __init__(self, observer, scale=1.0):
        self._observer = observer
        self._total_work = float(scale)
        self._work_done = 0.0

    def scale(self, total_work):
        """Change total amount of work."""
        if total_work < 0:
            raise ValueError(f"Negative total value: {total_work}")
        self._work_done = self.progress * total_work
        self._total_work = float(total_work)

    def update(self, work_done):
        """Update current amount of work done."""
        if work_done < 0:
            raise ValueError(f"Negative new value: {work_done}")
        work_done = min(work_done, self._total_work)
        if self._total_work != 0:
            change = (work_done - self._work_done) / self._total_work
        else:
            change = 0.0
        self._work_done = work_done
        self._observer(self.progress, change)

    def complete(self):
        """Mark the task as completed."""
        self.update(self._total_work)

    def increase(self, amount):
        """Increment amount of work done by the specified value."""
        self.update(self._work_done + amount)

    def subtask(self, work_amount):
        """Create a subtask corresponding to the specified amount of work."""

        def subtask_observer(_, progress_change):
            """Update the parent progress monitor."""
            self.increase(progress_change * work_amount)

        return ProgressMonitor(subtask_observer)

    @property
    def progress(self):
        """Get current progress [0.0, 1.0]"""
        if self._total_work == 0.0:
            return 1.0
        return self._work_done / self._total_work
