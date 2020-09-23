from .loading_utils import frame_to_global


class FrameToVideoRepresentation:

    def __init__(self, reps):
        """
        Args:
            reps (winnow.storage.repr_storage.ReprStorage): Intermediate representations storage.
        """
        self.reps = reps

    def start(self):
        frame_to_global(self.reps)
