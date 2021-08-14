/**
 * Initial state of the background task logs.
 * @type {Object}
 */
const initialState = {
  /**
   * Id of the task which logs are stored.
   */
  taskId: undefined,
  /**
   * Task logs.
   */
  logs: null,
  /**
   * Flag indicating there are more logs to fetch.
   */
  more: undefined,
};

export default initialState;
