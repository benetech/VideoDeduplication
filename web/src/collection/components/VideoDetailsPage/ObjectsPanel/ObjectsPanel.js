import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { FileType } from "../../../prop-types/FileType";
import ObjectGroupList from "./ObjectGroupList";
import { groupObjects } from "../groupObjects";
import ObjectGroupListItem from "./ObjectGroupListItem";
import useLoadObjects from "../useLoadObjects";
import { CircularProgress } from "@material-ui/core";
import { useServer } from "../../../../server-api/context";
import position from "../objectPosition";

const useStyles = makeStyles(() => ({
  objectPane: {
    height: 574,
    overflow: "auto",
  },
  loading: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const second = 1000; // in millis

function ObjectsPanel(props) {
  const { file, onJump, className, ...other } = props;
  const classes = useStyles();
  const server = useServer();

  // Load objects
  const { objects, done } = useLoadObjects({
    server,
    filters: { fileId: file.id },
    fields: ["template"],
  });

  const groups = useMemo(() => groupObjects(objects, 10 * second), [objects]);

  return (
    <div className={clsx(classes.objectPane, className)} {...other}>
      <ObjectGroupList>
        {groups.map((group) => (
          <ObjectGroupListItem
            objects={group}
            key={position(group[0])}
            onJump={onJump}
          />
        ))}
      </ObjectGroupList>
      {!done && (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
}

ObjectsPanel.propTypes = {
  /**
   * Video file
   */
  file: FileType.isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default ObjectsPanel;
