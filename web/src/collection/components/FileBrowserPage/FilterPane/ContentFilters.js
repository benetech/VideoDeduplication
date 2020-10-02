import React, { useCallback } from "react";
import PropTypes from "prop-types";
import FilterList from "./FilterList";
import { useFilters } from "./useFilters";
import { useIntl } from "react-intl";
import RangeFilter from "./RangeFilter";
import BoolFilter from "./BoolFilter";
import DateRangeFilter from "./DateRangeFilter";

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

ContentFilters.propTypes = {
  className: PropTypes.string,
};

export default ContentFilters;
