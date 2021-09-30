import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import FileSummary from "../../../components/files/FileSummary/FileSummary";
import { VideoFile } from "../../../model/VideoFile";

const useStyles = makeStyles<Theme>((theme) => ({
  header: {
    boxShadow: "0 12px 18px 0 rgba(0,0,0,0.08)",
    padding: theme.spacing(2),
  },
  name: {
    paddingBottom: theme.spacing(2),
  },
}));

function FileDetailsHeader(props: FileDetailsHeaderProps): JSX.Element {
  const { file, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.header, className)} {...other}>
      <FileSummary file={file} divider className={classes.name}>
        <FileSummary.Name />
      </FileSummary>
      <FileSummary file={file} divider>
        <FileSummary.Fingerprint />
        <FileSummary.Duration />
        <FileSummary.CreationDate />
      </FileSummary>
    </div>
  );
}

type FileDetailsHeaderProps = {
  /**
   * Video file to be summarized.
   */
  file: VideoFile;
  className?: string;
};
export default FileDetailsHeader;
