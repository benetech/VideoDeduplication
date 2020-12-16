"""Basic abstractions for managing background task queue.

There are two main components of task execution system:

* Various specialized Tasks that could be created from the REST API requests
  and dispatched to the task queue, or serialized and provided to the client
  as a JSON.
* TaskQueue which accepts Tasks, allows Task life-cycle management, allows
  to handle various task-related events, provides API to list existing tasks, etc.
"""
