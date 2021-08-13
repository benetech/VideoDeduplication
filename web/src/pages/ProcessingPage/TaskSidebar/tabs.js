import TaskStatus from "../../../prop-types/TaskStatus";

/**
 * Task sidebar header tabs.
 */
export const Tab = {
  ACTIVE: {
    title: "task.list.active",
    filter(task) {
      return (
        task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING
      );
    },
  },
  FINISHED: {
    title: "task.list.finished",
    filter(task) {
      return (
        task.status === TaskStatus.SUCCESS ||
        task.status === TaskStatus.FAILURE ||
        task.status === TaskStatus.CANCELLED
      );
    },
  },
  ALL: {
    title: "task.list.all",
    filter() {
      return true;
    },
  },
};

export const tabs = [Tab.ALL, Tab.ACTIVE, Tab.FINISHED];
