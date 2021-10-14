import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { formatDuration } from "../../../../lib/helpers/format";
import { useIntl } from "react-intl";
import { VideoFile } from "../../../../model/VideoFile";
import clsx from "clsx";

const useStyles = makeStyles<Theme>((theme) => ({
  attrValue: { ...theme.mixins.valueNormal, color: theme.palette.primary.main },
}));

function Duration(props: DurationProps): JSX.Element {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <div className={clsx(classes.attrValue, className)} {...other}>
      {formatDuration(file.metadata?.length || 0, intl)}
    </div>
  );
}

type DurationProps = {
  /**
   * File to be summarized.
   */
  file: VideoFile;
  className?: string;
};
export default Duration;
