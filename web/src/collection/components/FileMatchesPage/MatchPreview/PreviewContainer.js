import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FileType from "../../../prop-types/FileType";
import BasicContainer from "./BasicContainer";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

/**
 * Get translated text
 */
function useMessages(file) {
  const intl = useIntl();

  return {
    ariaLabel: file.external
      ? intl.formatMessage({ id: "aria.label.remoteMatch" })
      : intl.formatMessage(
          { id: "aria.label.matchedFile" },
          { name: file.filename }
        ),
  };
}

function PreviewContainer(props) {
  const { matchFile, children, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages(matchFile);

  return (
    <BasicContainer
      className={clsx(classes.root, className)}
      tabIndex={0}
      aria-label={messages.ariaLabel}
      data-selector="MatchPreview"
      data-file-id={matchFile?.id}
      {...other}
    >
      {children}
    </BasicContainer>
  );
}

PreviewContainer.propTypes = {
  /**
   * Matched file
   */
  matchFile: FileType.isRequired,
  /**
   * Preview elements.
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
};

export default PreviewContainer;
