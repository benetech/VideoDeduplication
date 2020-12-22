from .loading_utils import frame_to_global
from ..pipeline.progress_monitor import ProgressMonitor


class FrameToVideoRepresentation:
    def __init__(self, reps):
        """
        Args:
            reps (winnow.storage.repr_storage.ReprStorage): Intermediate
            representations storage.
        """
        self.reps = reps

    def start(self, progress_monitor=ProgressMonitor.NULL):
        frame_to_global(self.reps, progress_monitor=progress_monitor)
