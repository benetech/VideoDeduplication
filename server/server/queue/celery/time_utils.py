from datetime import datetime

DATE_TIME_FORMAT = "%Y-%m-%d %H:%M:%S.%f"


def dumps(time: datetime):
    return time.strftime(DATE_TIME_FORMAT)


def loads(date_string: str):
    return datetime.strptime(date_string, DATE_TIME_FORMAT)
