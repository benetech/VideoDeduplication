import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import FingerprintViewActions, { View } from "./FingerprintsViewActions";

const { useState } = require("react");

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.dimensions.content.padding * 2,
    padding: theme.dimensions.content.padding,
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  actions: {
    flexGrow: 1,
  },
  body: {
    minHeight: "min-content",
    display: "flex",
    alignItems: "stretch",
  },
  content: {
    flexGrow: 1,
  },
  settings: {},
}));

function FingerprintsView(props) {
  const { className } = props;
  const classes = useStyles();
  const [showSettings, setShowSettings] = useState(false);
  const [sort, setSort] = useState("");
  const [view, setView] = useState(View.grid);

  const toggleSettings = useCallback(() => setShowSettings(!showSettings), [
    showSettings,
  ]);

  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.header}>
        <FingerprintViewActions
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
          onAddMedia={console.log}
          onTune={toggleSettings}
          className={classes.actions}
        />
      </div>
      <div className={classes.body}>
        <div className={classes.content}>Hello Fingerprints</div>
      </div>
    </div>
  );
}

FingerprintsView.propTypes = {
  className: PropTypes.string,
};

export default FingerprintsView;
