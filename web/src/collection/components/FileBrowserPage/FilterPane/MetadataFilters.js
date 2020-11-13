import React, { useCallback } from "react";
import PropTypes from "prop-types";
import FileExtensionPicker from "./FileExtensionPicker";
import { useExtensions } from "./useExtensions";
import { useFilters } from "./useFilters";
import FilterList from "./FilterList";
import DateRangeFilter from "./DateRangeFilter";
import BoolFilter from "./BoolFilter";
import { useIntl } from "react-intl";
import { defaultFilters } from "../../../state/fileList/initialState";
import objectDiff from "../../../../common/helpers/objectDiff";
import { useSelector } from "react-redux";
import { selectFileFilters } from "../../../state/selectors";

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

/**
 * Get count of active filters.
 */
function useActiveFilters() {
  const filters = useSelector(selectFileFilters);
  const diff = objectDiff(filters, defaultFilters);
  return diff.extensions + diff.date + diff.audio + diff.exif;
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

/**
 * Hook to retrieve active filters count.
 */
MetadataFilters.useActiveFilters = useActiveFilters;

MetadataFilters.propTypes = {
  className: PropTypes.string,
};

export default MetadataFilters;
