import React, { useCallback, useMemo } from "react";
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
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";

/**
 * Get translated text
 */
function useMessages() {
  const intl = useIntl();
  return {
    caption: intl.formatMessage({ id: "file.attr.name" }),
    compare: intl.formatMessage({ id: "actions.compare" }),
    showDetails: intl.formatMessage({ id: "actions.showFileDetails" }),
  };
}

/**
 * Get comparison action.
 */
function useCompare({ matchFile, motherFile, messages }) {
  const history = useHistory();
  return useMemo(
    () => ({
      title: messages.compare,
      handler: () =>
        history.push(
          routes.collection.fileComparisonURL(motherFile?.id, matchFile?.id)
        ),
    }),
    [matchFile?.id, motherFile?.id]
  );
}

/**
 * Get "Show Details" action.
 */
function useShowDetails({ matchFile, messages }) {
  const history = useHistory();
  return useMemo(
    () => ({
      title: messages.showDetails,
      handler: () => history.push(routes.collection.fileURL(matchFile?.id)),
    }),
    [matchFile?.id]
  );
}

function useActions({ compare, showDetails, matchFile, motherFile }) {
  return useMemo(() => {
    if (motherFile?.external) {
      return [showDetails];
    }
    return [showDetails, compare];
  }, [matchFile?.id, matchFile?.id]);
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
  const compare = useCompare({ matchFile, motherFile, messages });
  const showDetails = useShowDetails({ matchFile, messages });
  const actions = useActions({ compare, showDetails, matchFile, motherFile });

  const mainAction = motherFile?.external ? showDetails : compare;

  return (
    <PreviewContainer
      matchFile={matchFile}
      className={clsx(className)}
      {...other}
    >
      <PreviewHeader
        text={matchFile.filename}
        highlight={highlight}
        caption={messages.caption}
        icon={VideocamOutlinedIcon}
        actions={actions}
      />
      <PreviewDivider />
      <PreviewFileAttributes file={matchFile} attrs={localAttributes} />
      <PreviewDivider />
      <Distance value={distance} />
      <PreviewDivider />
      <PreviewMainAction name={mainAction.title} onFire={mainAction.handler} />
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
