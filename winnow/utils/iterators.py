import itertools


def chunks(iterable, size=100):
    """Split iterable into equal-sized chunks."""
    iterator = iter(iterable)
    chunk = list(itertools.islice(iterator, size))
    while chunk:
        yield chunk
        chunk = list(itertools.islice(iterator, size))
