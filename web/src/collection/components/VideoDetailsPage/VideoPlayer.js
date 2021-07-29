import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../../prop-types/FileType";
import MediaPreview from "../../../common/components/MediaPreview";
import ReactPlayer from "react-player";
import { FLV_GLOBAL } from "react-player/lib/players/FilePlayer";
import flvjs from "flv.js";
import TimeCaption from "./TimeCaption";
import VideoController from "./VideoController";
import { useServer } from "../../../server-api/context";
import { Status } from "../../../server-api/Response";
import { useIntl } from "react-intl";
import WarningOutlinedIcon from "@material-ui/icons/WarningOutlined";
import SearchIcon from "@material-ui/icons/Search";
import Button from "../../../common/components/Button";
import playerPreviewURL from "./playerPreviewURL";

/**
 * Setup bundled flv.js.
 *
 * By default react-player tries to lazy-load playback SDK from CDN.
 * But the application must be able play video files when Internet
 * connection is not available. To solve that we bundle flv.js and
 * initialize global variable consumed by react-player's FilePlayer.
 *
 * See https://www.npmjs.com/package/react-player#sdk-overrides
 * See https://github.com/CookPete/react-player/issues/605#issuecomment-492561909
 */
function setupBundledFlvJs(options = { suppressLogs: false }) {
  const FLV_VAR = FLV_GLOBAL || "flvjs";
  if (window[FLV_VAR] == null) {
    window[FLV_VAR] = flvjs;
  }

  // Disable flv.js error messages and info messages (#149)
  if (options.suppressLogs) {
    flvjs.LoggingControl.enableError = false;
    flvjs.LoggingControl.enableVerbose = false;

    const doCreatePlayer = flvjs.createPlayer;
    flvjs.createPlayer = (mediaDataSource, optionalConfig) => {
      const player = doCreatePlayer(mediaDataSource, optionalConfig);
      player.on("error", () => {});
      return player;
    };
  }
}

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.palette.common.black,
    transform: "translate(0%, 0px)",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  player: {
    width: "100%",
    height: "100%",
    maxHeight: 300,
  },
  search: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    display: ({ search }) => (search ? "flex" : "none"),
    borderRadius: theme.spacing(0.5),
    color: theme.palette.common.white,
    backgroundColor: "rgba(5,5,5,0.4)",
  },
  error: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    backgroundColor: theme.palette.common.black,
    color: theme.palette.grey[500],
    ...theme.mixins.text,
  },
  errorIcon: {
    margin: theme.spacing(2),
  },
}));

function makePreviewActions(handleWatch) {
  return [{ name: "Watch Video", handler: handleWatch }];
}

/**
 * Get i18n text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    notFoundError: intl.formatMessage({ id: "video.error.missing" }),
    loadError: intl.formatMessage({ id: "video.error.load" }),
    playbackError: intl.formatMessage({ id: "video.error.playback" }),
    findFrame: intl.formatMessage({ id: "actions.findFrame" }),
  };
}

const VideoPlayer = function VideoPlayer(props) {
  const {
    file,
    onReady,
    onProgress,
    suppressErrors = false,
    onSearchFrame,
    seekTo,
    seekUnits = "fraction",
    className,
  } = props;

  const server = useServer();
  const messages = useMessages();
  const [hover, setHover] = useState(false);
  const [watch, setWatch] = useState(false);
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState(null);
  const classes = useStyles({ search: hover && watch && !error });

  const handleMouseOver = useCallback(() => setHover(true));
  const handleMouseOut = useCallback(() => setHover(false));
  const handleWatch = useCallback(() => {
    setWatch(true);
    setHover(true);
  }, []);
  const handleSearch = useCallback(() => {
    if (player != null) {
      onSearchFrame({ file, time: player.getCurrentTime() });
    }
  }, [player, file]);

  const controller = useMemo(() => new VideoController(player, setWatch), []);
  const previewActions = useMemo(() => makePreviewActions(handleWatch), []);

  // Reset player on file change
  useEffect(() => {
    setWatch(false);
    setPlayer(null);
    setError(null);
    controller._setPlayer(null);
    if (seekTo != null) {
      controller.seekTo(seekTo, { playing: false, units: seekUnits });
    }
  }, [file]);

  // Make sure flv.js is available
  useEffect(() => setupBundledFlvJs({ suppressLogs: suppressErrors }), []);

  // Provide controller to the consumer
  useEffect(() => onReady && onReady(controller), [onReady]);

  // Update controlled player
  useEffect(() => controller._setPlayer(player), [player]);

  // Check if video is available
  useEffect(() => {
    server.probeVideoFile({ id: file.id }).then((response) => {
      if (response.status === Status.NOT_FOUND) {
        setError(messages.notFoundError);
      } else if (response.status !== Status.OK) {
        setError(messages.loadError);
      }
    });
  }, [server, file.id]);

  // Seek to the requested position
  useEffect(() => {
    if (seekTo != null) {
      controller.seekTo(seekTo, { playing: false, units: seekUnits });
    }
  }, [seekTo]);

  // Enable support for flv files.
  // See https://github.com/CookPete/react-player#config-prop
  const exifType = file?.exif?.General_FileExtension?.trim();
  const forceFLV =
    exifType != null ? exifType === "flv" : file?.filename?.endsWith(".flv");

  return (
    <div className={clsx(className)}>
      {!watch && (
        <MediaPreview
          src={playerPreviewURL(file, seekTo, seekUnits)}
          alt={file.filename}
          className={classes.preview}
          actions={previewActions}
          caption={<TimeCaption time={file.metadata.length} />}
          onMediaClick={handleWatch}
        />
      )}
      {watch && error == null && (
        <div
          className={classes.container}
          onMouseEnter={handleMouseOver}
          onMouseLeave={handleMouseOut}
        >
          <ReactPlayer
            playing
            ref={setPlayer}
            width="100%"
            height="100%"
            controls
            url={file.playbackURL}
            onProgress={onProgress}
            onError={() => setError(messages.playbackError)}
            config={{
              file: {
                forceFLV,
              },
            }}
          />
          {onSearchFrame && (
            <div className={classes.search}>
              <Button color="inherit" onClick={handleSearch}>
                <SearchIcon />
                <span>{messages.findFrame}</span>
              </Button>
            </div>
          )}
        </div>
      )}
      {watch && error != null && (
        <div className={classes.error}>
          <WarningOutlinedIcon fontSize="large" className={classes.errorIcon} />
          {error}
        </div>
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
   * Seeking units.
   */
  seekUnits: PropTypes.oneOf(["seconds", "fraction"]),

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

  /**
   * Suppress error logs.
   */
  suppressErrors: PropTypes.bool,
  /**
   * Handle search for current frame.
   *
   * Callback will receive event containing file and desired time (in seconds).
   * e.g. {
   *   file: {id: 1, ...},
   *   time:
   * }
   */
  onSearchFrame: PropTypes.func,
  className: PropTypes.string,
};

export default VideoPlayer;
