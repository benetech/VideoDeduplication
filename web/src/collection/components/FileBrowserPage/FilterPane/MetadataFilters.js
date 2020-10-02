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
    dateHelp: intl.formatMessage({ id: "filter.creationDate.help" }),
    audio: intl.formatMessage({ id: "filter.hasAudio" }),
    audioHelp: intl.formatMessage({ id: "filter.hasAudio.help" }),
    exif: intl.formatMessage({ id: "filter.hasExif" }),
    exifHelp: intl.formatMessage({ id: "filter.hasExif.help" }),
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
        tooltip={messages.dateHelp}
      />
      <BoolFilter
        title={messages.audio}
        value={filters.audio}
        onChange={handleAudioChange}
        tooltip={messages.audioHelp}
      />
      <BoolFilter
        title={messages.exif}
        value={filters.exif}
        onChange={handleExifChange}
        tooltip={messages.exifHelp}
      />
    </FilterList>
  );
}

MetadataFilters.propTypes = {
  className: PropTypes.string,
};

export default MetadataFilters;
