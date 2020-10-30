import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import View from "./view";
import Button from "../../../common/components/Button";
import { useIntl } from "react-intl";
import IconSelect from "../../../common/components/IconSelect";
import GraphIcon from "@material-ui/icons/GrainOutlined";
import GridIcon from "@material-ui/icons/ViewModule";

const useStyles = makeStyles((theme) => ({
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
    useGraph: intl.formatMessage({ id: "actions.useGraphView" }),
    useGrid: intl.formatMessage({ id: "actions.useGridView" }),
    compare: intl.formatMessage({ id: "actions.compare" }),
  };
}
function FileMatchesActions(props) {
  const { view, onViewChange, onCompare, disabled = false, className } = props;
  const classes = useStyles();
  const messages = useMessages();

  return (
    <div className={clsx(classes.actions, className)}>
      <Button
        variant="contained"
        color="primary"
        onClick={onCompare}
        className={classes.button}
        disabled={disabled}
      >
        {messages.compare}
      </Button>
      <IconSelect value={view} onChange={onViewChange}>
        <IconSelect.Option
          icon={GraphIcon}
          value={View.graph}
          tooltip={messages.useGraph}
          disabled={disabled}
        />
        <IconSelect.Option
          icon={GridIcon}
          value={View.grid}
          tooltip={messages.useGrid}
          disabled={disabled}
        />
      </IconSelect>
    </div>
  );
}

FileMatchesActions.propTypes = {
  /**
   * Fires on compare request
   */
  onCompare: PropTypes.func,
  /**
   * Fires when view changes
   */
  onViewChange: PropTypes.func,
  /**
   * Current matches view
   */
  view: PropTypes.oneOf([View.graph, View.grid]),
  /**
   * True iff actions are inactivated
   */
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default FileMatchesActions;
