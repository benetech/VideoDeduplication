import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FingerprintType } from "../Fingerprints/type";
import MediaPreview from "../../../common/components/MediaPreview";
import ReactPlayer from "react-player";
import TimeCaption from "./TimeCaption";

const useStyles = makeStyles((theme) => ({
  container: {},
  preview: {
    width: "100%",
    height: "100%",
  },
  player: {
    width: "100%",
    height: "100%",
    maxHeight: 300,
  },
}));

function makePreviewActions(handleWatch) {
  return [{ name: "Watch Video", handler: handleWatch }];
}

function VideoPlayer(props) {
  const { file, className } = props;
  const classes = useStyles();
  const [watch, setWatch] = useState(false);

  const handleWatch = useCallback(() => setWatch(true), []);
  const previewActions = useMemo(() => makePreviewActions(handleWatch), []);

  return (
    <div className={clsx(className)}>
      {!watch && (
        <MediaPreview
          src={file.preview}
          alt={file.filename}
          className={classes.preview}
          actions={previewActions}
          caption={<TimeCaption time={file.metadata.length} />}
        />
      )}
      {watch && (
        <ReactPlayer
          width="100%"
          height="100%"
          controls
          url={file.playbackURL}
        />
      )}
    </div>
  );
}

VideoPlayer.propTypes = {
  file: FingerprintType.isRequired,
  className: PropTypes.string,
};

export default VideoPlayer;
