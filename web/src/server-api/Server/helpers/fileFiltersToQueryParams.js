import { format as formatDate } from "date-fns";

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
  if (filters?.exif != null) {
    params.exif = String(!!filters.exif);
  }
  if (filters?.length?.lower != null) {
    params.min_length = filters.length.lower * 60; // minutes to seconds
  }
  if (filters?.length?.upper != null) {
    params.max_length = filters.length.upper * 60; // minutes to seconds
  }
  if (filters?.date?.lower != null) {
    params.date_from = formatDate(filters.date.lower, "yyyy-MM-dd");
  }
  if (filters?.date?.upper != null) {
    params.date_to = formatDate(filters.date.upper, "yyyy-MM-dd");
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
  return params;
}
