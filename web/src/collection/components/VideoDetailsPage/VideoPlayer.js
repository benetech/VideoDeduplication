import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../FileBrowserPage/FileType";
import MediaPreview from "../../../common/components/MediaPreview";
import ReactPlayer from "react-player";
import TimeCaption from "./TimeCaption";
import VideoController from "./VideoController";

const useStyles = makeStyles(() => ({
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

const VideoPlayer = function VideoPlayer(props) {
  const { file, onReady, onProgress, className } = props;
  const classes = useStyles();
  const [watch, setWatch] = useState(false);
  const [player, setPlayer] = useState(null);

  const handleWatch = useCallback(() => setWatch(true), []);
  const controller = useMemo(() => new VideoController(player, setWatch), []);
  const previewActions = useMemo(() => makePreviewActions(handleWatch), []);

  // Provide controller to the consumer
  useEffect(() => onReady && onReady(controller), [onReady]);

  // Update controlled player
  useEffect(() => controller._setPlayer(player), [player]);

  // Enable support for flv files.
  // See https://github.com/CookPete/react-player#config-prop
  const exifType = file?.exif?.General_FileExtension?.trim();
  const forceFLV =
    exifType != null ? exifType === "flv" : file?.filename?.endsWith(".flv");

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
          onProgress={onProgress}
          config={{
            file: {
              forceFLV,
            },
          }}
        />
      )}
    </div>
  );
};

VideoPlayer.propTypes = {
  /**
   * Video file to be played
   */
  file: FileType.isRequired,

  /**
   * Position from which to start playing.
   * When seekTo value changes the player will seek
   * to the corresponding time position.
   */
  seekTo: PropTypes.number,

  /**
   * Callback that receives imperative player API
   */
  onReady: PropTypes.func,

  /**
   * Callback to receive playback status,
   * e.g. {
   *   played: 0.12,
   *   playedSeconds: 11.3,
   *   loaded: 0.34,
   *   loadedSeconds: 16.7
   * }
   *
   * See ReactPlayer's onProgress API for more details:
   * https://www.npmjs.com/package/react-player#callback-props
   */
  onProgress: PropTypes.func,
  className: PropTypes.string,
};

export default VideoPlayer;
