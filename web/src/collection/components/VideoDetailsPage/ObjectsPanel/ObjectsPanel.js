import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import ObjectGroupList from "./ObjectGroupList";
import { groupObjects } from "../groupObjects";
import ObjectGroupListItem from "./ObjectGroupListItem";
import position from "../objectPosition";
import ObjectType from "../../../prop-types/ObjectType";

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
  const { objects, onJump, className, ...other } = props;
  const classes = useStyles();

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
    </div>
  );
}

ObjectsPanel.propTypes = {
  /**
   * Objects recognized in video file.
   */
  objects: PropTypes.arrayOf(ObjectType).isRequired,
  /**
   * Jump to a particular object
   */
  onJump: PropTypes.func,
  className: PropTypes.string,
};

export default ObjectsPanel;
