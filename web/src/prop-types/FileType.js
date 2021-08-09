import PropTypes from "prop-types";
import ContributorType from "./ContributorType";

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
