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
   * Query task list.
   * @param {{
   *   limit: number,
   *   offset: number,
   *   filters: TaskFilters,
   * }} options query options
   * @returns {Promise<{total, offset, tasks}>}
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
      return this.transform.tasks(response.data);
    } catch (error) {
      throw makeServerError("Fetch tasks error.", error, { options });
    }
  }

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
   * @param {number|string|Task} task task object or task id.
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
   * @param {number|string|Task} task task or task id.
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
   * @param {number|string|Task} task task or task id
   * @return {Promise<Task>}
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
   * @param request
   * @return {Promise<Task>}
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
