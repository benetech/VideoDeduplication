import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import FileType from "../../../prop-types/FileType";
import PreviewContainer from "./PreviewContainer";
import PreviewHeader from "./PreviewHeader";
import PreviewDivider from "./PreviewDivider";
import PreviewFileAttributes from "./PreviewFileAttributes";
import Distance from "../../../../common/components/Distance";
import { localAttributes } from "./attributes";
import PreviewMainAction from "./PreviewMainAction";
import { routes } from "../../../../routing/routes";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";

/**
 * Get translated text
 */
function useMessages(file) {
  const intl = useIntl();
  return {
    compare: intl.formatMessage({ id: "actions.compare" }),
  };
}

function LocalMatchPreview(props) {
  const {
    motherFile,
    matchFile,
    distance,
    highlight,
    className,
    ...other
  } = props;
  const messages = useMessages();
  const history = useHistory();

  const compareURL = routes.collection.fileComparisonURL(
    motherFile?.id,
    matchFile?.id
  );

  const handleCompare = useCallback(() => history.push(compareURL), [
    compareURL,
  ]);

  return (
    <PreviewContainer
      matchFile={matchFile}
      className={clsx(className)}
      {...other}
    >
      <PreviewHeader type="local" name={matchFile.filename} />
      <PreviewDivider />
      <PreviewFileAttributes file={matchFile} attrs={localAttributes} />
      <PreviewDivider />
      <Distance value={distance} />
      <PreviewDivider />
      <PreviewMainAction name={messages.compare} onFire={handleCompare} />
    </PreviewContainer>
  );
}

LocalMatchPreview.propTypes = {
  /**
   * Mother file
   */
  motherFile: FileType.isRequired,
  /**
   * Matched file
   */
  matchFile: FileType.isRequired,
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

export default LocalMatchPreview;
