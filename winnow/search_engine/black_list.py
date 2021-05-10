from db.schema import TemplateTimeRangeExclusion, TemplateFileExclusion
from winnow.search_engine.model import Template
from winnow.storage.repr_key import ReprKey


class Cover:
    """Cover of some quantitative parameter by intervals.

    In particular it is used as a coverage of the video time by
    intervals excluded from some template scope.
    """

    def __init__(self):
        self._intervals = []

    def add(self, start, end):
        """Add interval to the cover."""
        self._intervals.append((start, end))

    def __contains__(self, value):
        """Check is the value is covered.

        Since intervals are added manually by users, we will not get a large
        number of them, and it is reasonable to simply check each interval.
        """
        for start, end in self._intervals:
            if start <= value <= end:
                return True
        return False

    def __len__(self):
        """Excluded intervals count."""
        return len(self._intervals)

    def overlaps(self, start, end):
        """Check if the interval overlaps with the cover.

        Start must be lesser or equal than end.
        """
        for check_start, check_end in self._intervals:
            if not (end < check_start or check_end < start):
                return True
        return False


class BlackList:
    """Template scope black list."""

    def __init__(self):
        self._file_exclusions = {}
        self._time_exclusions = {}

    @property
    def file_exclusions_count(self):
        result = 0
        for exclusions in self._file_exclusions.values():
            result += len(exclusions)
        return result

    @property
    def time_exclusions_count(self):
        result = 0
        for exclusions in self._time_exclusions.values():
            result += len(exclusions)
        return result

    def exclude_file(self, exclusion: TemplateFileExclusion):
        """Exclude file from the template scope."""
        if exclusion.template.name not in self._file_exclusions:
            self._file_exclusions[exclusion.template.name] = set()
        file = exclusion.file
        self._file_exclusions[exclusion.template.name].add((file.file_path, file.sha256))

    def exclude_time_range(self, exclusion: TemplateTimeRangeExclusion):
        """Exclude file's time range from the template scope."""
        entry_key = (exclusion.template.name, exclusion.file.file_path, exclusion.file.sha256)
        if entry_key not in self._time_exclusions:
            self._time_exclusions[entry_key] = Cover()
        cover = self._time_exclusions[entry_key]
        cover.add(start=exclusion.start_ms, end=exclusion.end_ms)

    def excluded_files(self, template: Template):
        return self._file_exclusions.get(template.name, ())

    def excluded_time(self, template: Template, file: ReprKey):
        entry_key = (template.name, file.path, file.hash)
        return self._time_exclusions.get(entry_key, Cover())
