import React, { useCallback } from "react";
import PropTypes from "prop-types";
import FilterList from "./FilterList";
import { useFilters } from "./useFilters";
import { useIntl } from "react-intl";
import RangeFilter from "./RangeFilter";
import { useSelector } from "react-redux";
import { selectFileFilters } from "../../../state/selectors";
import objectDiff from "../../../../common/helpers/objectDiff";
import { defaultFilters } from "../../../state/fileList/initialState";

/**
 * Get i18n text
 */
function useMessages() {
  const intl = useIntl();
  return {
    length: intl.formatMessage({ id: "filter.length" }),
    audio: intl.formatMessage({ id: "filter.hasAudio" }),
    date: intl.formatMessage({ id: "filter.creationDate" }),
  };
}

/**
 * Get count of active filters.
 */
function useActiveFilters() {
  const filters = useSelector(selectFileFilters);
  const diff = objectDiff(filters, defaultFilters);
  return Number(diff.length);
}

function ContentFilters(props) {
  const { className } = props;
  const messages = useMessages();
  const [filters, setFilters] = useFilters();

  const handleLengthChange = useCallback((length) => setFilters({ length }), [
    setFilters,
  ]);

  return (
    <FilterList className={className}>
      <RangeFilter
        title={messages.length}
        range={filters.length}
        onChange={handleLengthChange}
        minValue={0}
      />
    </FilterList>
  );
}

/**
 * Hook to get count of active filters.
 */
ContentFilters.useActiveFilters = useActiveFilters;

ContentFilters.propTypes = {
  className: PropTypes.string,
};

export default ContentFilters;
