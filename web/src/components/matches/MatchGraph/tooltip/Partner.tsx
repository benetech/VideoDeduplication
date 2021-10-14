import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useIntl } from "react-intl";
import { VideoFile } from "../../../../model/VideoFile";

const useStyles = makeStyles<Theme>((theme) => ({
  attrName: {
    ...theme.mixins.valueNormal,
    color: theme.palette.action.textInactive,
  },
  attrValue: { ...theme.mixins.valueNormal, color: theme.palette.primary.main },
}));

function Partner(props: PartnerProps): JSX.Element {
  const { file, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  return (
    <div className={className} {...other}>
      <span className={classes.attrName}>
        {intl.formatMessage({
          id: "file.owner",
        })}
        {": "}
      </span>
      <span className={classes.attrValue}>{file?.contributor?.name}</span>
    </div>
  );
}

type PartnerProps = {
  /**
   * File to be summarized.
   */
  file: VideoFile;
  className?: string;
};
export default Partner;
