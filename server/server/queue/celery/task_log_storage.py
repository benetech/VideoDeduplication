from task_queue.queue_log_handler import QueueLogHandler


class TaskLogStorage:
    @staticmethod
    def log_file_name(task_id):
        """Get task log file name by id."""
        return QueueLogHandler.log_file_name(task_id)
