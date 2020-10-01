import React, { useCallback } from "react";
import PropTypes from "prop-types";
import FileExtensionPicker from "./FileExtensionPicker";
import { useExtensions } from "./useExtensions";
import { useFilters } from "./useFilters";
import FilterList from "./FilterList";
import DateRangeFilter from "./DateRangeFilter";
import BoolFilter from "./BoolFilter";
import { useIntl } from "react-intl";

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    date: intl.formatMessage({ id: "filter.creationDate" }),
    audio: intl.formatMessage({ id: "filter.hasAudio" }),
    exif: intl.formatMessage({ id: "filter.hasExif" }),
  };
}

function MetadataFilters(props) {
  const { className } = props;
  const [filters, setFilters] = useFilters();
  const extensions = useExtensions();
  const messages = useMessages();

  const handleUpdateExtensions = useCallback(
    (extensions) => setFilters({ extensions }),
    [setFilters]
  );

  const handleDateChange = useCallback((date) => setFilters({ date }), [
    setFilters,
  ]);

  const handleAudioChange = useCallback((audio) => setFilters({ audio }), [
    setFilters,
  ]);

  const handleExifChange = useCallback((exif) => setFilters({ exif }), [
    setFilters,
  ]);

  return (
    <FilterList className={className}>
      <FileExtensionPicker
        selected={filters.extensions}
        onChange={handleUpdateExtensions}
        extensions={extensions}
      />
      <DateRangeFilter
        title={messages.date}
        range={filters.date}
        onChange={handleDateChange}
      />
      <BoolFilter
        title={messages.audio}
        value={filters.audio}
        onChange={handleAudioChange}
      />
      <BoolFilter
        title={messages.exif}
        value={filters.exif}
        onChange={handleExifChange}
      />
    </FilterList>
  );
}

MetadataFilters.propTypes = {
  className: PropTypes.string,
};

export default MetadataFilters;
