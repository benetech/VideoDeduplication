import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import AttributeTable from "../../../../../common/components/AttributeTable";
import { processOnlineVideoAttributes } from "../requestAttributes";
import TaskType from "../../../../prop-types/TaskType";

function ProcessOnlineVideoRequestAttrs(props) {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={task.request}
      attributes={processOnlineVideoAttributes}
      {...other}
    />
  );
}

ProcessOnlineVideoRequestAttrs.propTypes = {
  /**
   * Task which request will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default ProcessOnlineVideoRequestAttrs;
