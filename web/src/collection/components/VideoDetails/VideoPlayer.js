import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const { file, seekTo: position, className } = props;
  const classes = useStyles();
  const [watch, setWatch] = useState(false);
  const [player, setPlayer] = useState(null);

  const handleWatch = useCallback(() => setWatch(true), []);
  const previewActions = useMemo(() => makePreviewActions(handleWatch), []);

  // Handle seek
  useEffect(() => {
    if (position != null) {
      setWatch(true);
      if (player != null) {
        player.seekTo(position);
      }
    }
  }, [position]);

  // Handle initial seek
  useEffect(() => {
    if (player != null && position != null) {
      player.seekTo(position);
    }
  }, [player]);

  return (
    <div className={clsx(className)}>
      {!watch && (
        <MediaPreview
          src={file.preview}
          alt={file.filename}
          className={classes.preview}
          actions={previewActions}
          caption={<TimeCaption time={file.metadata.length} />}
          onMediaClick={handleWatch}
        />
      )}
      {watch && (
        <ReactPlayer
          playing
          ref={setPlayer}
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
  /**
   * Video file to be played
   */
  file: FingerprintType.isRequired,
  /**
   * Position from which to start playing.
   * When seekTo value changes the player will seek
   * to the corresponding time position.
   */
  seekTo: PropTypes.number,
  className: PropTypes.string,
};

export default VideoPlayer;
