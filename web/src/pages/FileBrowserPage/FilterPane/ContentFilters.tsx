import React, { useCallback } from "react";
import FilterList from "./FilterList";
import { useFilters } from "../../../application/api/files/useFilters";
import { useIntl } from "react-intl";
import RangeFilter from "./RangeFilter";
import objectDiff from "../../../lib/helpers/objectDiff";
import TemplateFilter from "./TemplateFilter";
import useFilesColl from "../../../application/api/files/useFilesColl";
import { DefaultFilters } from "../../../model/VideoFile";

/**
 * Get i18n text
 */

function useMessages() {
  const intl = useIntl();
  return {
    length: intl.formatMessage({
      id: "filter.length",
    }),
    audio: intl.formatMessage({
      id: "filter.hasAudio",
    }),
    date: intl.formatMessage({
      id: "filter.creationDate",
    }),
  };
}
/**
 * Get count of active filters.
 */

function useActiveFilters(): number {
  const filters = useFilesColl().params;
  const diff = objectDiff(filters, DefaultFilters);
  return Number(Boolean(diff.length)) + Number(Boolean(diff.templates));
}

function ContentFilters(props: ContentFiltersProps): JSX.Element {
  const { className } = props;
  const messages = useMessages();
  const [filters, setFilters] = useFilters();
  const handleLengthChange = useCallback(
    (length) =>
      setFilters({
        length,
      }),
    [setFilters]
  );
  const handleTemplatesChange = useCallback(
    (templates) =>
      setFilters({
        templates: templates.sort(),
      }),
    [setFilters]
  );
  return (
    <FilterList className={className}>
      <RangeFilter
        title={messages.length}
        range={filters.length}
        onChange={handleLengthChange}
        minValue={0}
      />
      <TemplateFilter
        value={filters.templates}
        onChange={handleTemplatesChange}
      />
    </FilterList>
  );
}
/**
 * Hook to get count of active filters.
 */

ContentFilters.useActiveFilters = useActiveFilters;
type ContentFiltersProps = {
  className?: string;
};
export default ContentFilters;
