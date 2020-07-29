import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import AddMediaButton from "./AddMediaButton";
import ViewSelector from "./ViewSelector";
import SortSelector from "./SortSelector";
import { Sort } from "./sort";
import { View } from "./view";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";

const useStyles = makeStyles((theme) => ({
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  action: {
    marginLeft: theme.spacing(2),
  },
}));

function FingerprintViewActions(props) {
  const {
    onAddMedia,
    view,
    onViewChange,
    sort,
    onSortChange,
    onTune,
    className,
  } = props;
  const classes = useStyles();

  return (
    <div className={clsx(classes.actions, className)}>
      <AddMediaButton
        onClick={onAddMedia}
        variant="contained"
        color="primary"
        className={classes.action}
      />
      <SortSelector
        value={sort}
        onChange={onSortChange}
        className={classes.action}
      />
      <ViewSelector
        view={view}
        className={classes.action}
        onChange={onViewChange}
      />
      <SquaredIconButton
        variant="outlined"
        color="secondary"
        onClick={onTune}
        className={classes.action}
      >
        <TuneIcon />
      </SquaredIconButton>
    </div>
  );
}

FingerprintViewActions.propTypes = {
  onAddMedia: PropTypes.func,
  sort: PropTypes.oneOf(["", Sort.size, Sort.date, Sort.duration]),
  onSortChange: PropTypes.func,
  view: PropTypes.oneOf([View.list, View.grid]),
  /**
   * Callback for switching List or Grid view
   */
  onViewChange: PropTypes.func,
  onTune: PropTypes.func,
  className: PropTypes.string,
};

export default FingerprintViewActions;
