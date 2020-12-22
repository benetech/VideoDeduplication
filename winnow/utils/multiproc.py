import multiprocessing as _std_multiprocessing

import billiard as _billiard

# Determine which multiprocessing API to use
if _std_multiprocessing.current_process().daemon:
    multiprocessing = _billiard
else:
    multiprocessing = _std_multiprocessing
