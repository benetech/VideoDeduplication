import PropTypes from "prop-types";

export const FingerprintType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  metadata: PropTypes.shape({
    uploadedBy: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    length: PropTypes.number.isRequired,
    frames: PropTypes.number.isRequired,
    codec: PropTypes.string.isRequired,
    averageGray: PropTypes.number.isRequired,
    hasEXIF: PropTypes.bool.isRequired,
    hasAudio: PropTypes.bool.isRequired,
    quality: PropTypes.number.isRequired,
  }).isRequired,
  hash: PropTypes.object.isRequired,
  fingerprint: PropTypes.string.isRequired,
  exif: PropTypes.object.isRequired,
});
