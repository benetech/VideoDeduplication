import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
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
import { FileMatch } from "../../../model/Match";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { useCompareFiles, useShowFile } from "../../../routing/hooks";
import useDeleteMatch from "../../../application/api/matches/useDeleteMatch";
import Action from "../../../model/Action";

const useStyles = makeStyles<Theme>((theme) => ({
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
    caption: intl.formatMessage({
      id: "file.attr.name",
    }),
    compare: intl.formatMessage({
      id: "actions.compare",
    }),
    showDetails: intl.formatMessage({
      id: "actions.showFileDetails",
    }),
    delete: intl.formatMessage({
      id: "match.delete",
    }),
    restore: intl.formatMessage({
      id: "actions.restore",
    }),
  };
}

type MatchActionContext = {
  match: FileMatch;
  messages: ReturnType<typeof useMessages>;
};

/**
 * Get delete action.
 */
function useToggleFalsePositive(options: MatchActionContext): Action {
  const { match, messages } = options;
  const { deleteMatch, restoreMatch } = useDeleteMatch();
  return useMemo<Action>(
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
function useCompare(options: MatchActionContext): Action {
  const { match, messages } = options;
  const compareFiles = useCompareFiles();
  const handleCompare = useCallback(() => {
    if (match.motherFile != null) {
      compareFiles(match.motherFile, match.file);
    }
  }, [match]);
  return useMemo<Action>(
    () => ({
      title: messages.compare,
      handler: handleCompare,
    }),
    [match.file.id, match.motherFile?.id]
  );
}
/**
 * Get "Show Details" action.
 */

function useShowDetails(options: MatchActionContext): Action {
  const { match, messages } = options;
  const showFile = useShowFile();
  const handleShowFile = useCallback(() => showFile(match.file), [match]);
  return useMemo(
    () => ({
      title: messages.showDetails,
      handler: handleShowFile,
    }),
    [match.file.id]
  );
}

type MatchActions = {
  compare: Action;
  showDetails: Action;
  toggleFalsePositive: Action;
  list: Action[];
};

function useActions(options: MatchActionContext): MatchActions {
  const { match, messages } = options;
  const compare = useCompare({
    match,
    messages,
  });
  const showDetails = useShowDetails({
    match,
    messages,
  });
  const toggleFalsePositive = useToggleFalsePositive({
    match,
    messages,
  });
  const list = useMemo(() => {
    if (match.motherFile?.external) {
      return [showDetails];
    }

    return [showDetails, toggleFalsePositive, compare];
  }, [showDetails, toggleFalsePositive, compare, match.motherFile?.external]);
  return {
    compare,
    showDetails,
    toggleFalsePositive,
    list,
  };
}

function LocalMatchPreview(props: LocalMatchPreviewProps): JSX.Element {
  const { match, highlight, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const actions = useActions({
    match,
    messages,
  });
  const mainAction = match.motherFile?.external
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

type LocalMatchPreviewProps = {
  /**
   * Match details
   */
  match: FileMatch;

  /**
   * File name substring to highlight
   */
  highlight?: string;
  className?: string;
};
export default LocalMatchPreview;
