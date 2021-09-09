import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import PreviewContainer from "./PreviewContainer";
import PreviewHeader from "./PreviewHeader";
import PreviewDivider from "./PreviewDivider";
import PreviewFileAttributes from "./PreviewFileAttributes";
import Distance from "../Distance";
import { localAttributes } from "./attributes";
import PreviewMainAction from "./PreviewMainAction";
import { useIntl } from "react-intl";
import InactiveIcon from "@material-ui/icons/NotInterestedOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import FileMatchType from "../../../prop-types/FileMatchType";

import { makeStyles } from "@material-ui/styles";
import { useCompareFiles, useShowFile } from "../../../routing/hooks";
import useDeleteMatch from "../../../application/api/matches/useDeleteMatch";

const useStyles = makeStyles((theme) => ({
  falsePositive: {
    backgroundColor: theme.palette.backgroundInactive,
  },
}));

/**
 * Get translated text
 */
function useMessages() {
  const intl = useIntl();
  return {
    caption: intl.formatMessage({ id: "file.attr.name" }),
    compare: intl.formatMessage({ id: "actions.compare" }),
    showDetails: intl.formatMessage({ id: "actions.showFileDetails" }),
    delete: intl.formatMessage({ id: "match.delete" }),
    restore: intl.formatMessage({ id: "actions.restore" }),
  };
}

/**
 * Get delete action.
 */
function useToggleFalsePositive({ match, messages }) {
  const { deleteMatch, restoreMatch } = useDeleteMatch();
  return useMemo(
    () => ({
      title: match.falsePositive ? messages.restore : messages.delete,
      handler: async () => {
        if (match.falsePositive) {
          await restoreMatch(match);
        } else {
          await deleteMatch(match);
        }
      },
    }),
    [match.id, match.falsePositive]
  );
}

/**
 * Get comparison action.
 */
function useCompare({ match, messages }) {
  const compareFiles = useCompareFiles([match.motherFile, match.file], [match]);
  return useMemo(
    () => ({
      title: messages.compare,
      handler: compareFiles,
    }),
    [match.file.id, match.motherFile.id]
  );
}

/**
 * Get "Show Details" action.
 */
function useShowDetails({ match, messages }) {
  const showFile = useShowFile(match.file, [match]);
  return useMemo(
    () => ({
      title: messages.showDetails,
      handler: showFile,
    }),
    [match.file.id]
  );
}

function useActions({ match, messages }) {
  const compare = useCompare({ match, messages });
  const showDetails = useShowDetails({ match, messages });
  const toggleFalsePositive = useToggleFalsePositive({ match, messages });
  const list = useMemo(() => {
    if (match.motherFile.external) {
      return [showDetails];
    }
    return [showDetails, toggleFalsePositive, compare];
  }, [showDetails, toggleFalsePositive, compare, match.motherFile.external]);

  return {
    compare,
    showDetails,
    toggleFalsePositive,
    list,
  };
}

function LocalMatchPreview(props) {
  const { match, highlight, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const actions = useActions({ match, messages });

  const mainAction = match.motherFile.external
    ? actions.showDetails
    : actions.compare;

  const Icon = match.falsePositive ? InactiveIcon : VideocamOutlinedIcon;

  return (
    <PreviewContainer
      className={clsx(match.falsePositive && classes.falsePositive, className)}
      {...other}
    >
      <PreviewHeader
        text={match.file.filename}
        highlight={highlight}
        caption={messages.caption}
        icon={Icon}
        actions={actions.list}
      />
      <PreviewDivider dark={match.falsePositive} />
      <PreviewFileAttributes file={match.file} attrs={localAttributes} />
      <PreviewDivider dark={match.falsePositive} />
      <Distance value={match.distance} />
      <PreviewDivider dark={match.falsePositive} />
      <PreviewMainAction name={mainAction.title} onFire={mainAction.handler} />
    </PreviewContainer>
  );
}

LocalMatchPreview.propTypes = {
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
