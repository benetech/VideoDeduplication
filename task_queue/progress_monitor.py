from task_queue.metadata import TaskRuntimeMetadata
from winnow.pipeline.progress_monitor import ProgressMonitor


def make_progress_monitor(task, total_work=1.0):
    """Create a progress monitor for a winnow task."""

    def update_progress(progress, _):
        """Send a metadata update."""
        task.update_metadata(TaskRuntimeMetadata(progress=progress))

    return ProgressMonitor(observer=update_progress, scale=total_work)
