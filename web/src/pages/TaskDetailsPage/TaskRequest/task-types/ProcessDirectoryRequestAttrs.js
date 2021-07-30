import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import AttributeTable from "../../../../components/basic/AttributeTable";
import { processDirectoryAttributes } from "../requestAttributes";
import TaskType from "../../../../prop-types/TaskType";

function ProcessDirectoryRequestAttrs(props) {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={task.request}
      attributes={processDirectoryAttributes}
      {...other}
    />
  );
}

ProcessDirectoryRequestAttrs.propTypes = {
  /**
   * Task which request will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default ProcessDirectoryRequestAttrs;
