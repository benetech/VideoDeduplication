import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import MatchType from "../MatchType";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import Marked from "../../../../common/components/Marked";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import FileAttributes from "./FileAttributes";
import Distance from "./Distance";
import { useIntl } from "react-intl";
import ButtonBase from "@material-ui/core/ButtonBase";
import { useHistory } from "react-router-dom";
import { routes } from "../../../../routing/routes";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    "&:focus": {
      outline: "none",
      boxShadow: "0 12px 18px 0 rgba(0,0,0,0.28)",
    },
  },
  nameContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  nameAttr: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
  },
  caption: {
    ...theme.mixins.captionText,
    marginBottom: theme.spacing(0.5),
  },
  name: {
    ...theme.mixins.textEllipsisStart,
    ...theme.mixins.title4,
    color: theme.palette.primary.main,
    fontWeight: "bold",
    flexGrow: 1,
  },
  icon: {
    color: theme.palette.common.black,
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  iconContainer: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: theme.spacing(1),
  },
  divider: {
    borderTop: "1px solid #F5F5F5",
  },
  attrs: {
    margin: theme.spacing(1),
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
    moreInfo: intl.formatMessage({ id: "actions.moreInfo" }),
    ariaLabel: intl.formatMessage(
      { id: "aria.label.matchedFile" },
      { name: file.filename }
    ),
    moreOptions: intl.formatMessage({ id: "actions.showMoreOptions" }),
  };
}

function MatchPreview(props) {
  const { match, highlight, className } = props;
  const file = match.file;
  const intl = useIntl();
  const classes = useStyles();
  const messages = useMessages(file);
  const history = useHistory();

  const handleMoreInfo = useCallback(
    () => history.push(routes.collection.fileURL(file.id)),
    [match]
  );

  return (
    <Paper
      className={clsx(classes.root, className)}
      tabIndex={0}
      aria-label={messages.ariaLabel}
    >
      <div className={classes.nameContainer}>
        <div className={classes.iconContainer}>
          <VideocamOutlinedIcon className={classes.icon} />
        </div>
        <div className={classes.nameAttr}>
          <div className={classes.caption}>
            {intl.formatMessage({ id: "file.attr.name" })}
          </div>
          <div className={classes.name}>
            <Marked mark={highlight}>{file.filename}</Marked>
          </div>
        </div>
        <IconButton size="small" aria-label={messages.moreOptions}>
          <MoreHorizOutlinedIcon fontSize="small" />
        </IconButton>
      </div>
      <div className={classes.divider} />
      <FileAttributes file={file} className={classes.attrs} />
      <div className={classes.divider} />
      <Distance value={match.distance} className={classes.distance} />
      <div className={classes.divider} />
      <div className={classes.more}>
        <ButtonBase
          className={classes.link}
          onClick={handleMoreInfo}
          focusRipple
          disableTouchRipple
          aria-label={messages.moreInfo}
        >
          {messages.moreInfo}
        </ButtonBase>
      </div>
    </Paper>
  );
}

MatchPreview.propTypes = {
  /**
   * Match between two files
   */
  match: MatchType.isRequired,
  /**
   * File name substring to highlight
   */
  highlight: PropTypes.string,
  className: PropTypes.string,
};

export default MatchPreview;
