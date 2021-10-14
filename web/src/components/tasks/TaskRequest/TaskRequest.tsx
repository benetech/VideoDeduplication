import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import SelectableTabs, { SelectableTab } from "../../basic/SelectableTabs";
import { RequestViews } from "./requestViews";
import { useIntl } from "react-intl";
import { Task } from "../../../model/Task";
import { RequestViewMap, TaskRequestViewComponent } from "./model";

const useStyles = makeStyles<Theme>((theme) => ({
  tabs: {
    marginLeft: theme.spacing(2),
  },
  content: {
    marginTop: theme.spacing(4),
  },
}));

function TaskRequest(props: TaskRequestProps): JSX.Element {
  const { task, viewMap = RequestViews, className, ...other } = props;
  const classes = useStyles();
  const intl = useIntl();
  const views = useMemo(() => viewMap[task.request.type], [task.request.type]);
  const [currentView, setView] = useState(views[0]);
  const Component = currentView.component as TaskRequestViewComponent;
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

type TaskRequestProps = {
  /**
   * Task which request will be displayed.
   */
  task: Task;
  viewMap?: RequestViewMap;
  className?: string;
};
export default TaskRequest;
