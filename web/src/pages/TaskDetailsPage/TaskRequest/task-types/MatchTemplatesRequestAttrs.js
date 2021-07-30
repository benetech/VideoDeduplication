import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import AttributeTable from "../../../../components/basic/AttributeTable";
import { matchTemplatesAttributes } from "../requestAttributes";
import TaskType from "../../../../prop-types/TaskType";

function MatchTemplatesRequestAttrs(props) {
  const { task, className, ...other } = props;
  return (
    <AttributeTable
      className={clsx(className)}
      value={task.request}
      attributes={matchTemplatesAttributes}
      {...other}
    />
  );
}

MatchTemplatesRequestAttrs.propTypes = {
  /**
   * Task which request will be displayed.
   */
  task: TaskType.isRequired,
  className: PropTypes.string,
};

export default MatchTemplatesRequestAttrs;
