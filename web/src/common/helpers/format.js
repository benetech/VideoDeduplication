export function parseDuration(duration) {
  const millis = Math.round(duration % 1000);
  const seconds = Math.round((duration % (1000 * 60)) / 1000);
  const minutes = Math.round((duration % (1000 * 60 * 60)) / (1000 * 60));
  const hours = Math.round(duration / (1000 * 60 * 60));
  return { millis, seconds, minutes, hours };
}

function pad(time) {
  return String(time).padStart(2, "0");
}

export function formatDuration(duration, intl, showUnits = true) {
  const t = parseDuration(duration);
  if (t.hours > 0) {
    if (showUnits) {
      const units = intl.formatMessage({ id: "value.time.hours" });
      return `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)} ${units}`;
    } else {
      return `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`;
    }
  }
  if (showUnits) {
    const units = intl.formatMessage({ id: "value.time.minutes" });
    return `${pad(t.minutes)}:${pad(t.seconds)} ${units}`;
  } else {
    return `${pad(t.minutes)}:${pad(t.seconds)}`;
  }
}

export function formatDate(date, intl) {
  if (date == null) {
    return;
  }
  return intl.formatDate(date, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export function formatBool(value, intl) {
  const messageID = value ? "value.bool.true" : "value.bool.false";
  return intl.formatMessage({ id: messageID });
}
