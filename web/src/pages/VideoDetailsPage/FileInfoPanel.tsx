import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { VideoFile } from "../../model/VideoFile";
import { fileAttributes } from "./fileAttributes";
import AttributeTable from "../../components/basic/AttributeTable";

const useStyles = makeStyles<Theme>({
  panel: {
    height: 574,
    overflow: "auto",
  },
});

function FileInfoPanel(props: FileInfoPanelProps): JSX.Element {
  const { file, className, ...other } = props;
  const classes = useStyles();
  return (
    <div className={clsx(classes.panel, className)} {...other}>
      <AttributeTable value={file} attributes={fileAttributes} />
    </div>
  );
}

type FileInfoPanelProps = React.HTMLProps<HTMLDivElement> & {
  /**
   * Video file
   */
  file: VideoFile;
  className?: string;
};
export default FileInfoPanel;
