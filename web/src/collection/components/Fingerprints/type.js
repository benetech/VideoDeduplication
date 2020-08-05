import PropTypes from "prop-types";

export const FingerprintType = PropTypes.shape({
  id: PropTypes.string,
  filename: PropTypes.string.isRequired,
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
  }).isRequired,
  hash: PropTypes.object,
  fingerprint: PropTypes.string,
  exif: PropTypes.object,
});
