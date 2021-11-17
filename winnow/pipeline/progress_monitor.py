import abc
import sys

from tqdm import tqdm


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

    @property
    @abc.abstractmethod
    def total(self):
        """Get total work to be done."""


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

    @property
    def total(self):
        return 0.0


def _null_observer(progress, increase):
    """No-op observer."""


class ProgressMonitor(BaseProgressMonitor):
    NULL = _NullProgressMonitor()

    def __init__(self, observer=_null_observer, scale=1.0):
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

    @property
    def total(self):
        """Get total work scale."""
        return self._total_work


class ProgressBar(BaseProgressMonitor):
    """Wrapper around a progress-monitor which will display a progress bar on the console."""

    def __init__(self, monitor: BaseProgressMonitor = None, file=sys.stdout, unit="it", **kwargs):
        self._monitor: BaseProgressMonitor = monitor or ProgressMonitor()
        self._progress_bar: tqdm = tqdm(file=file, total=self._monitor.total, unit=unit, **kwargs)
        self._progress_bar.update(self._monitor.progress * self._monitor.total)

    def scale(self, total_work):
        self._monitor.scale(total_work)
        self._progress_bar.reset(total=total_work)

    def update(self, work_done):
        current = self._monitor.total * self._monitor.progress
        self._monitor.update(work_done)
        self._progress_bar.update(work_done - current)

    def complete(self):
        self._monitor.complete()
        self._progress_bar.close()

    def increase(self, amount):
        self._monitor.increase(amount)
        self._progress_bar.update(amount)

    def subtask(self, work_amount):
        return self._monitor.subtask(work_amount)

    @property
    def progress(self):
        return self._monitor.progress

    @property
    def total(self):
        return self._monitor.total
