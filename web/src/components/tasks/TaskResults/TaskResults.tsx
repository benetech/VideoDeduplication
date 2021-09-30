import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { Task } from "../../../model/Task";
import { useIntl } from "react-intl";
import { TaskResultViews } from "./taskResultViews";
import SelectableTabs, { SelectableTab } from "../../basic/SelectableTabs";
import { TaskResultViewMap } from "./model";
import { TaskRequestViewComponent } from "../TaskRequest/model";

const useStyles = makeStyles<Theme>((theme) => ({
  tabs: {
    marginLeft: theme.spacing(2),
  },
  content: {
    marginTop: theme.spacing(4),
  },
}));

function TaskResults(props: TaskResultsProps): JSX.Element | null {
  const { task, viewMap = TaskResultViews, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  const views = useMemo(() => viewMap[task.request.type], [task]);
  const [currentView, setView] = useState(views[0]);
  const Component = currentView.component as TaskRequestViewComponent;

  if (task.result == null) {
    return null;
  }

  return (
    <div className={clsx(className)} {...other}>
      <SelectableTabs
        value={currentView}
        onChange={setView}
        className={classes.tabs}
      >
        {views.map((view) => (
          <SelectableTab
            label={intl.formatMessage({
              id: view.title,
            })}
            value={view}
            key={view.title}
          />
        ))}
      </SelectableTabs>
      <div className={classes.content}>
        <Component task={task} />
      </div>
    </div>
  );
}

type TaskResultsProps = {
  /**
   * Task which results will be displayed.
   */
  task: Task;
  viewMap?: TaskResultViewMap;
  className?: string;
};
export default TaskResults;
