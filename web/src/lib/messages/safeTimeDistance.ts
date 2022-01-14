import { IntlShape } from "react-intl";
import { formatDistance } from "date-fns";
import { Nullable } from "../types/util-types";

export function safeTimeDistance(
  pastDate: Nullable<Date>,
  intl: IntlShape
): string {
  if (pastDate == null) {
    return intl.formatMessage({ id: "time.never" });
  }
  return intl.formatMessage(
    { id: "time.ago" },
    { time: formatDistance(pastDate, new Date()) }
  );
}
