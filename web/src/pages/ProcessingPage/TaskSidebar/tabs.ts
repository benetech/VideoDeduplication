import { Task, TaskStatus } from "../../../model/Task";

export type TaskSidebarTab = {
  title: string;
  filter: (task: Task) => boolean;
};

export const DefaultTabs: TaskSidebarTab[] = [
  {
    title: "task.list.active",
    filter(task) {
      return (
        task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING
      );
    },
  },
  {
    title: "task.list.finished",
    filter(task) {
      return (
        task.status === TaskStatus.SUCCESS ||
        task.status === TaskStatus.FAILURE ||
        task.status === TaskStatus.CANCELLED
      );
    },
  },
  {
    title: "task.list.all",
    filter() {
      return true;
    },
  },
];
