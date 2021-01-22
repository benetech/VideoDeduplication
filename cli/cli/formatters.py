import enum
import json
import sys

import yaml

from cli.console.color import highlight


def _select_fields(data, fields):
    return {field: value for field, value in data.items() if field in fields}


class CsvFormatter:
    def __init__(self, header=True, separator=","):
        self._header = header
        self._sep = separator

    def _value(self, value):
        value = str(value)
        if self._sep in value:
            value = repr(value)
        return value

    def format(self, items, fields, file=sys.stdout, highlights=None):
        print(self._sep.join(fields), file=file)
        for item in items:
            values = (self._value(item[field]) for field in fields)
            print(self._sep.join(values), file=file)


class PlainFormatter:
    def _rows(self, items, fields):
        for item in items:
            yield (str(item[field]) for field in fields)

    def _align(self, values, lengths):
        for value, length in zip(values, lengths):
            yield value + " " * (length - len(value))

    def _highlight(self, values, fields, highlights):
        for value, field in zip(values, fields):
            yield highlight(value, highlights.get(field))

    def format(self, items, fields, file=sys.stdout, highlights=None):
        rows = [[field.upper() for field in fields]] + [
            [str(item.get(field, "")) for field in fields] for item in items
        ]
        highlights = highlights or {}
        lengths = [max(len(value) for value in column) for column in zip(*rows)]
        separator = " " * 2
        for i, row in enumerate(rows):
            aligned = self._align(row, lengths)
            highlighted = self._highlight(aligned, fields, highlights)
            print(separator.join(highlighted), file=file)


class JsonFormatter:
    def format(self, items, fields, file=sys.stdout, highlights=None):
        items = [{field: item[field] for field in fields} for item in items]
        json.dump(items, file, indent=4, sort_keys=True)


class YamlFormatter:
    def format(self, items, fields, file=sys.stdout, highlights=None):
        items = [{field: item[field] for field in fields} for item in items]
        yaml.dump(items, file, default_flow_style=False)


class Format(enum.Enum):
    PLAIN = "plain"
    CSV = "csv"
    JSON = "json"
    YAML = "yaml"


def resolve_formatter(format: Format = Format.PLAIN):
    if format is Format.PLAIN:
        return PlainFormatter()
    elif format is Format.CSV:
        return CsvFormatter(separator=",", header=True)
    elif format is Format.JSON:
        return JsonFormatter()
    elif format is Format.YAML:
        return YamlFormatter()
    else:
        raise ValueError(f"Unknown format: {format}")
