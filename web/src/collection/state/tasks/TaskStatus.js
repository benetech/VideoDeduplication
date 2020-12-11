/**
 * Enum for tasks statuses.
 */
export const TaskStatus = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  CANCELLED: "CANCELLED",

  /**
   * Get all possible values.
   */
  values() {
    return [
      this.PENDING,
      this.RUNNING,
      this.SUCCESS,
      this.FAILURE,
      this.CANCELLED,
    ];
  },
};

export default TaskStatus;
