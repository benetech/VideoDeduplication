import PropTypes from "prop-types";
import ContributorType from "./ContributorType";

/**
 * @typedef {{
 *   uploadedBy: string|undefined,
 *   updatedDate: number|undefined,
 *   fileType: string|undefined,
 *   length: number|undefined,
 *   frames: number|undefined,
 *   codec: string|undefined,
 *   grayMax: number|undefined,
 *   grayStd: number|undefined,
 *   stdAverage: number|undefined,
 *   maxDiff: number|undefined,
 *   hasEXIF: boolean|undefined,
 *   hasAudio: boolean|undefined,
 *   quality: number|undefined,
 *   flagged: boolean|undefined,
 * }} FileMetadata
 *
 *  @typedef {{
 *    id: string|number,
 *    filename: string,
 *    metadata: FileMetadata|undefined,
 *    hash: string,
 *    fingerprint: string,
 *    preview: string,
 *    playbackURL: string,
 *    exif: Object,
 *    external: boolean,
 *    contributor: ContributorEntity|undefined,
 *  }} FileEntity
 */

/**
 * Prop type for a file processed by the application.
 */
export const FileType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  filename: PropTypes.string,
  metadata: PropTypes.shape({
    uploadedBy: PropTypes.string,
    uploadDate: PropTypes.number,
    fileType: PropTypes.string,
    length: PropTypes.number,
    frames: PropTypes.number,
    codec: PropTypes.string,
    grayMax: PropTypes.number,
    grayStd: PropTypes.number,
    stdAverage: PropTypes.number,
    maxDiff: PropTypes.number,
    hasEXIF: PropTypes.bool,
    hasAudio: PropTypes.bool,
    quality: PropTypes.number,
    flagged: PropTypes.bool,
  }),
  hash: PropTypes.string,
  fingerprint: PropTypes.string,
  preview: PropTypes.string,
  playbackURL: PropTypes.string,
  exif: PropTypes.object,
  external: PropTypes.bool,
  contributor: ContributorType,
});

export default FileType;
