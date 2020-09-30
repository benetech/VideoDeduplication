import React, { useCallback } from "react";
import PropTypes from "prop-types";
import FilterList from "./FilterList";
import { useFilters } from "./useFilters";
import { useIntl } from "react-intl";
import RangeFilter from "./RangeFilter";

/**
 * Get i18n text
 */
function useMessages() {
  const intl = useIntl();
  return {
    lengthTitle: intl.formatMessage({ id: "filter.length" }),
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
        title={messages.lengthTitle}
        range={filters.length}
        onChange={handleLengthChange}
      />
    </FilterList>
  );
}

ContentFilters.propTypes = {
  className: PropTypes.string,
};

export default ContentFilters;
