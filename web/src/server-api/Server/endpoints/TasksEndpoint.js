import { makeServerError } from "../ServerError";
import TasksTransformer from "./transformers/TasksTransformer";
import getEntityId from "../../../lib/helpers/getEntityId";

/**
 * Client for tasks API endpoint.
 */
export default class TasksEndpoint {
  constructor(axios, transform) {
    this.axios = axios;
    this.transform = transform || new TasksTransformer();
  }

  /**
   * @typedef {{
   *   limit: number,
   *   offset: number,
   *   filters: TaskFilters,
   * }} ListTasksOptions
   */

  /**
   * Query task list.
   * @param {ListTasksOptions} options query options
   * @returns {Promise<ListTasksResults>}
   */
  async list(options = {}) {
    try {
      const { limit = 1000, offset = 0, filters = {} } = options;
      const response = await this.axios.get(`/tasks/`, {
        params: {
          limit,
          offset,
          ...this.transform.listParams({ filters }),
        },
      });
      return this.transform.tasks(response.data, options);
    } catch (error) {
      throw makeServerError("Fetch tasks error.", error, { options });
    }
  }

  /**
   * Get single task by id.
   * @param {string|number} id
   * @return {Promise<TaskEntity>}
   */
  async get(id) {
    try {
      const response = await this.axios.get(`/tasks/${id}`, {
        params: {},
      });
      return this.transform.task(response.data);
    } catch (error) {
      throw makeServerError("Fetch task error.", error, { id });
    }
  }

  /**
   * Get task logs.
   * @param {number|string|TaskEntity} task task object or task id.
   * @return {Promise<*>}
   */
  async logs(task) {
    try {
      const response = await this.axios.get(
        `/tasks/${getEntityId(task)}/logs`,
        {
          params: {},
        }
      );
      return response.data;
    } catch (error) {
      throw makeServerError("Fetch logs error.", error, { task });
    }
  }

  /**
   * Delete task.
   * @param {number|string|TaskEntity} task task or task id.
   * @return {Promise<void>}
   */
  async delete(task) {
    try {
      await this.axios.delete(`/tasks/${getEntityId(task)}`);
    } catch (error) {
      throw makeServerError("Delete task error.", error, { task });
    }
  }

  /**
   * Cancel existing task.
   * @param {number|string|TaskEntity} task task or task id
   * @return {Promise<TaskEntity>}
   */
  async cancel(task) {
    try {
      const response = await this.axios.patch(
        `/tasks/${getEntityId(task)}`,
        JSON.stringify({ status: "REVOKED" }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.task(response.data);
    } catch (error) {
      throw makeServerError("Cancel task error.", error, { task });
    }
  }

  /**
   * Create and run a new task.
   * @param {TaskRequest} request
   * @return {Promise<TaskEntity>}
   */
  async create(request) {
    try {
      const response = await this.axios.post(
        `/tasks/`,
        JSON.stringify(this.transform.toRequestDTO(request)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return this.transform.task(response.data);
    } catch (error) {
      throw makeServerError("Create task error.", error, { request });
    }
  }
}
