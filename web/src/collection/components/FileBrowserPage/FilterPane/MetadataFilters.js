import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import FileExtensionPicker from "./FileExtensionPicker";
import { useFilters } from "./useFilters";
import FilterList from "./FilterList";
import DateRangeFilter from "./DateRangeFilter";
import BoolFilter from "./BoolFilter";
import { useIntl } from "react-intl";
import { defaultFilters } from "../../../state/fileList/initialState";
import objectDiff from "../../../../common/helpers/objectDiff";
import { useSelector } from "react-redux";
import { selectFileFilters } from "../../../state/selectors";
import useFileExtensions from "../../../../application/stats/useFileExtensions";
import {
  parseDateRange,
  stringifyDateRange,
} from "../../../../common/helpers/date-range";

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
    origin: intl.formatMessage({ id: "filter.origin" }),
    originHelp: intl.formatMessage({ id: "filter.origin.help" }),
    originRemote: intl.formatMessage({ id: "filter.origin.remote" }),
    originLocal: intl.formatMessage({ id: "filter.origin.local" }),
  };
}

/**
 * Get count of active filters.
 */
function useActiveFilters() {
  const filters = useSelector(selectFileFilters);
  const diff = objectDiff(filters, defaultFilters);
  return diff.extensions + diff.date + diff.audio + diff.exif + diff.remote;
}

function MetadataFilters(props) {
  const { className, ...other } = props;
  const [filters, setFilters] = useFilters();
  const extensions = useFileExtensions();
  const messages = useMessages();
  const dateRange = useMemo(() => parseDateRange(filters.date), [filters.date]);

  const handleUpdateExtensions = useCallback(
    (extensions) => setFilters({ extensions }),
    [setFilters]
  );

  const handleDateChange = useCallback(
    (date) => setFilters({ date: stringifyDateRange(date) }),
    [setFilters]
  );

  const handleAudioChange = useCallback((audio) => setFilters({ audio }), [
    setFilters,
  ]);

  const handleExifChange = useCallback((exif) => setFilters({ exif }), [
    setFilters,
  ]);

  const handleRemoteChange = useCallback((remote) => setFilters({ remote }), [
    setFilters,
  ]);

  return (
    <FilterList className={className} {...other}>
      <FileExtensionPicker
        selected={filters.extensions}
        onChange={handleUpdateExtensions}
        extensions={extensions}
      />
      <DateRangeFilter
        title={messages.date}
        range={dateRange}
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
      <BoolFilter
        title={messages.origin}
        value={filters.remote}
        onChange={handleRemoteChange}
        tooltip={messages.originHelp}
        trueText={messages.originRemote}
        falseText={messages.originLocal}
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
