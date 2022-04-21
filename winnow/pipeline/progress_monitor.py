import abc
import collections
import math
import sys
from typing import Any, Callable, Union, Collection, List, Optional

from tqdm import tqdm

# Type hint for progress observer
ProgressObserver = Callable[[float, float], Any]

# Type hint for multiple observers or single
ProgressObservers = Union[ProgressObserver, Collection[ProgressObserver]]


class BaseProgressMonitor(abc.ABC):
    @abc.abstractmethod
    def scale(self, total_work: float, unit: str = "") -> "BaseProgressMonitor":
        """Change total amount of work."""

    @abc.abstractmethod
    def update(self, work_done: float):
        """Update current amount of work done."""

    @abc.abstractmethod
    def complete(self):
        """Mark the task as completed."""

    @abc.abstractmethod
    def increase(self, amount: float):
        """Increment amount of work done by the specified value."""

    @abc.abstractmethod
    def subtask(self, work_amount: float) -> "BaseProgressMonitor":
        """Create a subtask corresponding to the specified amount of work."""

    @property
    @abc.abstractmethod
    def progress(self) -> float:
        """Get current progress [0.0, 1.0]"""

    @property
    @abc.abstractmethod
    def total(self) -> float:
        """Get total work to be done."""

    @abc.abstractmethod
    def observe(self, observer: ProgressObserver):
        """Add observer."""

    def remaining(self) -> "BaseProgressMonitor":
        """Get remaining work as a subtask."""
        remaining_work = self.total - self.progress * self.total
        return self.subtask(work_amount=remaining_work)

    def bar(
        self, amount: float = None, scale: float = 1.0, unit: str = "work", lazy_portion: Optional[float] = None
    ) -> "BaseProgressMonitor":
        """Create progress bar."""
        if amount is not None:
            subtask = self.subtask(work_amount=amount).scale(scale)
        else:
            subtask = self.remaining().scale(scale)
        return LazyProgress(ProgressBar(subtask, unit=unit), portion=lazy_portion)


class _NullProgressMonitor(BaseProgressMonitor):
    """A NoOp implementation of progress monitor."""

    def scale(self, total_work: float, unit: str = "") -> BaseProgressMonitor:
        return self

    def update(self, work_done: float):
        pass

    def complete(self):
        pass

    def increase(self, amount: float):
        pass

    def subtask(self, work_amount: float) -> BaseProgressMonitor:
        return self

    @property
    def progress(self) -> float:
        return 0.0

    @property
    def total(self) -> float:
        return 0.0

    def observe(self, observer: ProgressObserver):
        pass

    def remaining(self) -> "BaseProgressMonitor":
        return self


class ProgressMonitor(BaseProgressMonitor):
    NULL = _NullProgressMonitor()

    def __init__(self, observer: ProgressObservers = (), scale: float = 1.0):
        self._observers: List[ProgressObserver] = self._init_observers(observer)
        self._total_work: float = float(scale)
        self._work_done: float = 0.0

    def _init_observers(self, observer: ProgressObservers) -> List[ProgressObserver]:
        """Initialize observers."""
        if isinstance(observer, collections.Collection):
            return list(observer)
        elif observer is None:
            return []
        else:
            return [observer]

    def scale(self, total_work: float, unit: str = "") -> BaseProgressMonitor:
        """Change total amount of work."""
        if total_work < 0:
            raise ValueError(f"Negative total value: {total_work}")
        self._work_done = self.progress * total_work
        self._total_work = float(total_work)
        return self

    def update(self, work_done: float):
        """Update current amount of work done."""
        if work_done < 0:
            raise ValueError(f"Negative new value: {work_done}")
        work_done = min(work_done, self._total_work)
        if self._total_work != 0:
            change = (work_done - self._work_done) / self._total_work
        else:
            change = 0.0
        self._work_done = work_done
        for observer in self._observers:
            observer(self.progress, change)

    def complete(self):
        """Mark the task as completed."""
        self.update(self._total_work)

    def increase(self, amount: float):
        """Increment amount of work done by the specified value."""
        self.update(self._work_done + amount)

    def subtask(self, work_amount: float) -> BaseProgressMonitor:
        """Create a subtask corresponding to the specified amount of work."""

        def subtask_observer(_, progress_change):
            """Update the parent progress monitor."""
            self.increase(progress_change * work_amount)

        return ProgressMonitor(subtask_observer)

    @property
    def progress(self) -> float:
        """Get current progress [0.0, 1.0]"""
        if self._total_work == 0.0:
            return 1.0
        return self._work_done / self._total_work

    @property
    def total(self) -> float:
        """Get total work scale."""
        return self._total_work

    def observe(self, observer: ProgressObserver):
        self._observers.append(observer)


class ProgressBar(BaseProgressMonitor):
    """Wrapper around a progress-monitor which will display a progress bar on the console."""

    def __init__(self, monitor: BaseProgressMonitor = None, file=sys.stdout, unit: str = "it", **kwargs):
        self._monitor: BaseProgressMonitor = monitor or ProgressMonitor()
        self._progress_bar: tqdm = tqdm(file=file, total=self._monitor.total, unit=unit, **kwargs)
        self._progress_bar.update(self._monitor.progress * self._monitor.total)

    def scale(self, total_work: float, unit: str = "it") -> BaseProgressMonitor:
        self._monitor.scale(total_work, unit)
        self._progress_bar.reset(total=total_work)
        self._progress_bar.unit = unit
        return self

    def update(self, work_done: float):
        current = self._monitor.total * self._monitor.progress
        self._monitor.update(work_done)
        self._progress_bar.update(work_done - current)

    def complete(self):
        self._monitor.complete()
        self._progress_bar.close()

    def increase(self, amount: float):
        self._monitor.increase(amount)
        self._progress_bar.update(amount)

    def subtask(self, work_amount: float) -> BaseProgressMonitor:
        """Create progress bar subtask."""

        # Make sure subtask updates also affect current progress bar
        def subtask_observer(_, progress_change):
            """Update the parent progress monitor."""
            self.increase(progress_change * work_amount)

        subtask: BaseProgressMonitor = self._monitor.subtask(work_amount)
        subtask.observe(subtask_observer)

        return subtask

    @property
    def progress(self) -> float:
        return self._monitor.progress

    @property
    def total(self) -> float:
        return self._monitor.total

    def observe(self, observer: ProgressObserver):
        self._monitor.observe(observer)


class LazyProgress(BaseProgressMonitor):
    """
    LazyProgress monitor updates notifies progress monitor only
    when significant amount of work is done.
    """

    @staticmethod
    def _suggest_portion(total_work: float) -> float:
        """Suggest a "reasonable" work portion."""
        threshold = 10000
        if total_work <= threshold:
            return float(total_work) / threshold
        return int(total_work ** 0.5)

    def __init__(self, delegate: BaseProgressMonitor, portion: float = None):
        self._accumulator = 0
        self._delegate = delegate
        self._portion_size = portion or self._suggest_portion(delegate.total)

    def scale(self, total_work: float, unit: str = "it") -> BaseProgressMonitor:
        factor = float(total_work) / self._delegate.total
        self._accumulator *= factor
        self._portion_size *= factor
        self._delegate.scale(total_work, unit)
        return self

    def update(self, work_done: float):
        self._delegate.update(work_done)
        safe_work_done = self._delegate.progress * self._delegate.total
        self._accumulator = safe_work_done - math.floor(safe_work_done / self._portion_size) * self._portion_size

    def complete(self):
        self._accumulator = 0
        self._delegate.complete()

    def increase(self, amount: float):
        self._accumulator += amount
        if self._accumulator > self._portion_size:
            self._delegate.increase(self._accumulator)
            self._accumulator = 0

    def subtask(self, work_amount: float) -> BaseProgressMonitor:
        # Preserve laziness
        return LazyProgress(delegate=self._delegate.subtask(work_amount), portion=self._portion_size)

    @property
    def progress(self) -> float:
        return self._delegate.progress

    @property
    def total(self) -> float:
        return self._delegate.total

    def observe(self, observer):
        self._delegate.observe(observer)
