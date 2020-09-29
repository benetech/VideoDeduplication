import React, { useCallback } from "react";
import PropTypes from "prop-types";
import FileExtensionPicker from "./FileExtensionPicker";
import { useExtensions } from "./useExtensions";
import { useFilters } from "./useFilters";
import FilterList from "./FilterList";

function MetadataFilters(props) {
  const { className } = props;
  const [filters, setFilters] = useFilters();
  const extensions = useExtensions();

  const handleUpdateExtensions = useCallback(
    (extensions) => setFilters({ extensions }),
    []
  );

  return (
    <FilterList className={className}>
      <FileExtensionPicker
        selected={filters.extensions}
        onChange={handleUpdateExtensions}
        extensions={extensions}
      />
    </FilterList>
  );
}

MetadataFilters.propTypes = {
  className: PropTypes.string,
};

export default MetadataFilters;
