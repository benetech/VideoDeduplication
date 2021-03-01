import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileAttributes from "./FileAttributes";
import { useIntl } from "react-intl";
import ButtonBase from "@material-ui/core/ButtonBase";
import FileType from "../../../prop-types/FileType";
import Container from "./Container";
import Distance from "../../../../common/components/Distance";
import MatchHeader from "./MatchHeader";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  divider: {
    borderTop: "1px solid #F5F5F5",
  },
  attrs: {
    margin: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1,
  },
  distance: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  more: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  link: {
    ...theme.mixins.captionText,
    color: theme.palette.primary.main,
    cursor: "pointer",
  },
}));

/**
 * Get i18n text
 */
function useMessages(file) {
  const intl = useIntl();
  return {
    compare: intl.formatMessage({ id: "actions.compare" }),
    ariaLabel: intl.formatMessage(
      { id: "aria.label.matchedFile" },
      { name: file.filename }
    ),
    moreOptions: intl.formatMessage({ id: "actions.showMoreOptions" }),
  };
}

/**
 * Get header attributes.
 */
function header(file) {
  const type = file?.external ? "remote" : "local";
  const name = file?.external ? file.hash : file.filename;
  return { type, name };
}

function MatchPreview(props) {
  const { file, distance, highlight, onCompare, className } = props;
  const classes = useStyles();
  const messages = useMessages(file);

  const handleCompare = useCallback(() => onCompare(file), [file, onCompare]);

  return (
    <Container
      className={clsx(classes.root, className)}
      tabIndex={0}
      aria-label={messages.ariaLabel}
      data-selector="MatchPreview"
      data-file-id={file.id}
    >
      <MatchHeader {...header(file)} highlight={highlight} />
      <div className={classes.divider} />
      <FileAttributes file={file} className={classes.attrs} />
      <div className={classes.spacer} />
      <div className={classes.divider} />
      <Distance value={distance} className={classes.distance} />
      <div className={classes.divider} />
      <ButtonBase
        className={classes.more}
        onClick={handleCompare}
        focusRipple
        aria-label={messages.compare}
      >
        <div className={classes.link}>{messages.compare}</div>
      </ButtonBase>
    </Container>
  );
}

MatchPreview.propTypes = {
  /**
   * Matched file
   */
  file: FileType.isRequired,
  /**
   * Handle compare
   */
  onCompare: PropTypes.func.isRequired,
  /**
   * Match distance
   */
  distance: PropTypes.number.isRequired,
  /**
   * File name substring to highlight
   */
  highlight: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Preview container component
 */
MatchPreview.Container = Container;

export default MatchPreview;
