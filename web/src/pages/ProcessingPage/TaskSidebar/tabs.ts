import { Task, TaskStatus } from "../../../model/Task";

export type TaskSidebarTab = {
  title: string;
  filter: (task: Task) => boolean;
};

export const DefaultTabs: TaskSidebarTab[] = [
  {
    title: "task.list.all",
    filter(): boolean {
      return true;
    },
  },
  {
    title: "task.list.active",
    filter(task: Task): boolean {
      return (
        task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING
      );
    },
  },
  {
    title: "task.list.finished",
    filter(task: Task): boolean {
      return (
        task.status === TaskStatus.SUCCESS ||
        task.status === TaskStatus.FAILURE ||
        task.status === TaskStatus.CANCELLED
      );
    },
  },
];
