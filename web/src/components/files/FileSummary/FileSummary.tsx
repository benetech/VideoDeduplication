import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import Name from "./Name";
import { VideoFile } from "../../../model/VideoFile";
import Fingerprint from "./Fingerprint";
import Duration from "./Duration";
import CreationDate from "./CreationDate";
import HasAudio from "./HasAudio";
import indentAttributes from "../../basic/AttributeLists/indentAttributes";
import RemoteHash from "./RmoteHash";
import RemoteRepo from "./RemoteRepo";
import RemoteOwner from "./RemoteOwner";
import MatchCount from "./MatchCount";

const useStyles = makeStyles<Theme>({
  summary: {
    display: "flex",
    alignItems: "center",
  },
});
/**
 * Set the following properties: selected, onSelect and value (if absent)
 */

function bindProps(
  file: VideoFile
): (attribute: React.ReactNode) => React.ReactNode | null {
  return (attribute) => {
    if (!React.isValidElement(attribute)) {
      return null;
    }

    return React.cloneElement(attribute, {
      file,
      ...attribute.props,
    });
  };
}
/**
 * Linear file attribute list.
 */

function FileSummary(props: FileSummaryProps): JSX.Element {
  const { file, children, divider = false, className, ...other } = props;
  const classes = useStyles(); // Set required child properties

  let attributes: React.ReactNode[] | null | undefined = React.Children.map(
    children,
    bindProps(file)
  );

  // Add dividers or spacers between attribute elements
  attributes = indentAttributes(attributes, divider);

  return (
    <div className={clsx(classes.summary, className)} {...other}>
      {attributes}
    </div>
  );
}

FileSummary.Name = Name;
FileSummary.Fingerprint = Fingerprint;
FileSummary.Duration = Duration;
FileSummary.CreationDate = CreationDate;
FileSummary.HasAudio = HasAudio;
FileSummary.RemoteHash = RemoteHash;
FileSummary.RemoteRepo = RemoteRepo;
FileSummary.RemoteOwner = RemoteOwner;
FileSummary.MatchCount = MatchCount;

type FileSummaryProps = {
  /**
   * Video file to be summarized.
   */
  file: VideoFile;

  /**
   * Show divider between attributes.
   */
  divider?: boolean;

  /**
   * Summary attributes list.
   */
  children?: React.ReactNode;
  className?: string;
};
export default FileSummary;
