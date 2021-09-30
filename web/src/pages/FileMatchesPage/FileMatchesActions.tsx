import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { MatchesView } from "./view";
import Button from "../../components/basic/Button";
import { useIntl } from "react-intl";
import IconSelect from "../../components/basic/IconSelect";
import GraphIcon from "@material-ui/icons/GrainOutlined";
import GridIcon from "@material-ui/icons/ViewModule";
import IconSelectOption from "../../components/basic/IconSelect/IconSelectOption";

const useStyles = makeStyles<Theme>((theme) => ({
  actions: {
    display: "flex",
    alignItems: "center",
  },
  button: {
    marginRight: theme.spacing(2),
  },
}));
/**
 * Get i18n text
 */

function useMessages() {
  const intl = useIntl();
  return {
    useGraph: intl.formatMessage({
      id: "actions.useGraphView",
    }),
    useGrid: intl.formatMessage({
      id: "actions.useGridView",
    }),
    compare: intl.formatMessage({
      id: "actions.compare",
    }),
  };
}

function FileMatchesActions(props: FileMatchesActionsProps): JSX.Element {
  const {
    view,
    onViewChange,
    onCompare,
    disabled = false,
    remote = false,
    className,
  } = props;
  const classes = useStyles();
  const messages = useMessages();
  return (
    <div className={clsx(classes.actions, className)}>
      {!remote && (
        <Button
          variant="contained"
          color="primary"
          onClick={onCompare}
          className={classes.button}
          disabled={disabled}
        >
          {messages.compare}
        </Button>
      )}
      <IconSelect value={view} onChange={onViewChange}>
        <IconSelectOption
          icon={GraphIcon}
          value={MatchesView.graph}
          tooltip={messages.useGraph}
          disabled={disabled}
        />
        <IconSelectOption
          icon={GridIcon}
          value={MatchesView.grid}
          tooltip={messages.useGrid}
          disabled={disabled}
        />
      </IconSelect>
    </div>
  );
}

type FileMatchesActionsProps = {
  /**
   * Fires on compare request
   */
  onCompare?: () => void;

  /**
   * Fires when view changes
   */
  onViewChange?: (view: MatchesView) => void;

  /**
   * Current matches view
   */
  view: MatchesView;

  /**
   * True iff actions are inactivated
   */
  disabled?: boolean;

  /**
   * Indicates remote file.
   */
  remote?: boolean;
  className?: string;
};
export default FileMatchesActions;
