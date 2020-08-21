import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Paper from "@material-ui/core/Paper";
import { FingerprintType } from "../Fingerprints/type";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import AttributeText from "../../../common/components/AttributeText";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  titleGroup: {
    flexGrow: 1,
    flexShrink: 1,
    display: "flex",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(4),
    height: theme.spacing(4),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.spacing(0.25),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(3),
  },
  icon: {
    color: theme.palette.primary.contrastText,
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  attrsGroup: {},
}));

function useMessages() {
  const intl = useIntl();
  return {
    filename: intl.formatMessage({ id: "file.attr.name" }),
    fingerprint: intl.formatMessage({ id: "file.attr.fingerprint" }),
    quality: intl.formatMessage({ id: "file.attr.quality" }),
  };
}

function VideoDetailsHeader(props) {
  const { file, className } = props;
  const classes = useStyles();
  const history = useHistory();
  const messages = useMessages();

  const back = history.length > 0;
  const handleBack = useCallback(() => history.goBack(), [history]);

  return (
    <Paper className={clsx(classes.header, className)}>
      <div className={classes.titleGroup}>
        {back && (
          <IconButton onClick={handleBack}>
            <ArrowBackOutlinedIcon />
          </IconButton>
        )}
        <div className={classes.iconContainer}>
          <VideocamOutlinedIcon className={classes.icon} />
        </div>
        <AttributeText
          name={messages.filename}
          value={file.filename}
          variant="title"
        />
      </div>
    </Paper>
  );
}

VideoDetailsHeader.propTypes = {
  /**
   * Video file to be played
   */
  file: FingerprintType.isRequired,
  className: PropTypes.string,
};

export default VideoDetailsHeader;
