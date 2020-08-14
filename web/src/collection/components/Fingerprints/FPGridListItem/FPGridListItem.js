import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FingerprintType } from "../type";
import Paper from "@material-ui/core/Paper";
import MediaPreview from "./MediaPreview";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import { composition } from "../FPGridList";

const useStyles = makeStyles((theme) => ({
  itemContainer: {},
  gridItem: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
  },
  asButton: {
    cursor: "pointer",
  },
  preview: {
    height: theme.dimensions.gridItem.imageHeight,
  },
  nameContainer: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  name: {
    ...theme.mixins.textEllipsisStart,
    ...theme.mixins.title5,
    flexGrow: 1,
  },
  icon: {
    color: theme.palette.primary.contrastText,
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(3),
    height: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: theme.spacing(1),
  },
}));

function FpGridListItem(props) {
  const { file, button = false, className } = props;

  const classes = useStyles();
  return (
    <Grid
      item
      xs={12 / composition.xs}
      sm={12 / composition.sm}
      md={12 / composition.md}
      lg={12 / composition.lg}
      xl={12 / composition.xl}
      className={classes.itemContainer}
    >
      <Paper
        className={clsx(
          classes.gridItem,
          button && classes.asButton,
          className
        )}
      >
        <MediaPreview
          src={file.preview}
          alt="preview"
          className={classes.preview}
        />
        <div className={classes.nameContainer}>
          <div className={classes.iconContainer}>
            <VideocamOutlinedIcon className={classes.icon} />
          </div>
          <div className={classes.name}>{file.filename}</div>
          <IconButton size="small">
            <MoreHorizOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
      </Paper>
    </Grid>
  );
}

FpGridListItem.propTypes = {
  file: FingerprintType.isRequired,
  button: PropTypes.bool,
  className: PropTypes.string,
};

export default FpGridListItem;
