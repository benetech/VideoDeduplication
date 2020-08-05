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

export function formatDuration(duration, intl) {
  const dur = parseDuration(duration);
  if (dur.hours > 0) {
    const units = intl.formatMessage({ id: "value.time.hours" });
    return `${pad(dur.hours)}:${pad(dur.minutes)}:${pad(dur.seconds)} ${units}`;
  }
  const units = intl.formatMessage({ id: "value.time.minutes" });
  return `${pad(dur.minutes)}:${pad(dur.seconds)} ${units}`;
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
