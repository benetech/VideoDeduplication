import parse from "date-fns/parse";

export const defaultDateFormat = "yyyy-MM-dd HH:mm:ss.SSSSSS";

export default function utcDate(
  date: string,
  format: string = defaultDateFormat
): Date {
  const utcDate = parse(date, format, new Date());
  const timestamp = Date.UTC(
    utcDate.getFullYear(),
    utcDate.getMonth(),
    utcDate.getDate(),
    utcDate.getHours(),
    utcDate.getMinutes(),
    utcDate.getSeconds(),
    utcDate.getMilliseconds()
  );
  return new Date(timestamp);
}
