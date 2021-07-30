import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import AttributeTable from "../../../../components/basic/AttributeTable";
import { findFrameAttributes } from "../requestAttributes";
import TaskType from "../../../../prop-types/TaskType";

function FindFrameRequestAttrs(props) {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      value={task.request}
      attributes={findFrameAttributes}
      className={clsx(className)}
      {...other}
    />
  );
}

FindFrameRequestAttrs.propTypes = {
  /**
   * Task which request will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default FindFrameRequestAttrs;
