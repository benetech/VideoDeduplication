import React, { useMemo } from "react";
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
import MatchAPI from "../../../../application/match/MatchAPI";
import FileMatchType from "../../../../application/match/prop-types/FileMatchType";

/**
 * Get translated text
 */
function useMessages() {
  const intl = useIntl();
  return {
    caption: intl.formatMessage({ id: "file.attr.name" }),
    compare: intl.formatMessage({ id: "actions.compare" }),
    showDetails: intl.formatMessage({ id: "actions.showFileDetails" }),
    delete: intl.formatMessage({ id: "actions.delete" }),
  };
}

/**
 * Get delete action.
 */
function useDelete({ match, messages }) {
  const matchAPI = MatchAPI.use();
  return useMemo(
    () => ({
      title: messages.delete,
      handler: async () => {
        const updated = { ...match, falsePositive: true };
        await matchAPI.updateFileMatch(updated, match);
      },
    }),
    [matchAPI]
  );
}

/**
 * Get comparison action.
 */
function useCompare({ match, motherFile, messages }) {
  const history = useHistory();
  return useMemo(
    () => ({
      title: messages.compare,
      handler: () =>
        history.push(
          routes.collection.fileComparisonURL(motherFile?.id, match.file?.id)
        ),
    }),
    [match.file?.id, motherFile?.id]
  );
}

/**
 * Get "Show Details" action.
 */
function useShowDetails({ match, messages }) {
  const history = useHistory();
  return useMemo(
    () => ({
      title: messages.showDetails,
      handler: () => history.push(routes.collection.fileURL(match.file.id)),
    }),
    [match.file.id]
  );
}

function useActions({ match, motherFile, messages }) {
  const compare = useCompare({ match, motherFile, messages });
  const showDetails = useShowDetails({ match, messages });
  const deleteMatch = useDelete({ match, messages });
  const list = useMemo(() => {
    if (motherFile?.external) {
      return [showDetails];
    }
    return [showDetails, deleteMatch, compare];
  }, [match.file.id, motherFile?.id]);

  return {
    compare,
    showDetails,
    deleteMatch,
    list,
  };
}

function LocalMatchPreview(props) {
  const { motherFile, match, highlight, className, ...other } = props;
  const messages = useMessages();
  const actions = useActions({ match, motherFile, messages });

  const mainAction = motherFile?.external
    ? actions.showDetails
    : actions.compare;

  return (
    <PreviewContainer className={clsx(className)} {...other}>
      <PreviewHeader
        text={match.file.filename}
        highlight={highlight}
        caption={messages.caption}
        icon={VideocamOutlinedIcon}
        actions={actions.list}
      />
      <PreviewDivider />
      <PreviewFileAttributes file={match.file} attrs={localAttributes} />
      <PreviewDivider />
      <Distance value={match.distance} />
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
   * Match details
   */
  match: FileMatchType.isRequired,
  /**
   * File name substring to highlight
   */
  highlight: PropTypes.string,
  className: PropTypes.string,
};

export default LocalMatchPreview;
