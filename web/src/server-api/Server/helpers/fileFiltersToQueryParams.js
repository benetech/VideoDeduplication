import { format as formatDate } from "date-fns";
import parseDate from "../../../common/helpers/parseDate";

/**
 * Convert file filters to axios request params.
 */
export default function fileFiltersToQueryParams(filters) {
  const params = {};
  if (filters?.query) {
    params.path = filters.query;
  }
  if (filters?.audio != null) {
    params.audio = String(!!filters.audio);
  }
  if (filters?.length?.lower != null) {
    params.min_length = filters.length.lower * 60000; // minutes to milliseconds
  }
  if (filters?.length?.upper != null) {
    params.max_length = filters.length.upper * 60000; // minutes to milliseconds
  }
  if (filters?.date?.lower != null) {
    params.date_from = formatDate(parseDate(filters.date.lower), "yyyy-MM-dd");
  }
  if (filters?.date?.upper != null) {
    params.date_to = formatDate(parseDate(filters.date.upper), "yyyy-MM-dd");
  }
  if (filters?.extensions && filters?.extensions?.length > 0) {
    const extensions = filters.extensions
      .map((ext) => ext.trim())
      .filter((ext) => ext.length > 0);
    if (extensions.length > 0) {
      params.extensions = extensions.join(",");
    }
  }
  if (filters?.matches != null) {
    params.matches = filters.matches;
  }
  if (filters?.sort) {
    params.sort = filters.sort;
  }
  if (filters?.remote != null) {
    params.remote = filters.remote;
  }
  if (filters?.templates != null && filters.templates.length > 0) {
    params.templates = filters.templates.join(",");
  }
  return params;
}
