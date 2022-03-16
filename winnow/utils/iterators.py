import itertools
from typing import Callable, Any, Iterator


def chunks(iterable, size=100):
    """Split iterable into equal-sized chunks."""
    iterator = iter(iterable)
    chunk = list(itertools.islice(iterator, size))
    while chunk:
        yield chunk
        chunk = list(itertools.islice(iterator, size))


def skip(predicate: Callable[[Any], bool], items: Iterator[Any]) -> Iterator[Any]:
    """Skip items for which the predicate returns True."""
    for item in items:
        if not predicate(item):
            yield item
