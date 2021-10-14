import { AxiosInstance } from "axios";
import getEntityId from "../../../lib/entity/getEntityId";
import { makeServerError } from "../../ServerError";
import TasksTransformer from "../transform/TasksTransformer";
import {
  ListOptions,
  ListRequest,
  ListResults,
  TasksAPI,
} from "../../ServerAPI";
import { Task, TaskFilters, TaskRequest } from "../../../model/Task";
import { QueryResultsDTO } from "../dto/query";
import { RawTaskStatus, TaskDTO } from "../dto/tasks";

/**
 * Client for tasks API endpoint.
 */
export default class TasksEndpoint implements TasksAPI {
  private readonly axios: AxiosInstance;
  private readonly transform: TasksTransformer;

  constructor(axios: AxiosInstance, transform?: TasksTransformer) {
    this.axios = axios;
    this.transform = transform || new TasksTransformer();
  }

  /**
   * Query task list.
   */
  async list(
    options: ListOptions<TaskFilters> = {}
  ): Promise<ListResults<Task, TaskFilters>> {
    try {
      const request = TasksEndpoint.completeRequest(options);
      const { limit, offset, filters } = request;
      const response = await this.axios.get<QueryResultsDTO<TaskDTO>>(
        `/tasks/`,
        {
          params: {
            limit,
            offset,
            ...this.transform.listParams(filters),
          },
        }
      );
      return this.transform.tasks(response.data, request);
    } catch (error) {
      throw makeServerError("Fetch tasks error.", error, { options });
    }
  }

  /**
   * Get single task by id.
   */
  async get(id: Task["id"]): Promise<Task> {
    try {
      const response = await this.axios.get<TaskDTO>(`/tasks/${id}`, {
        params: {},
      });
      return this.transform.task(response.data);
    } catch (error) {
      throw makeServerError("Fetch task error.", error, { id });
    }
  }

  /**
   * Get task logs.
   */
  async logs(task: Task | Task["id"]): Promise<string> {
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
   */
  async delete(task: Task | Task["id"]): Promise<void> {
    try {
      await this.axios.delete(`/tasks/${getEntityId(task)}`);
    } catch (error) {
      throw makeServerError("Delete task error.", error, { task });
    }
  }

  /**
   * Cancel existing task.
   */
  async cancel(task: Task | Task["id"]): Promise<Task> {
    try {
      const response = await this.axios.patch<TaskDTO>(
        `/tasks/${getEntityId(task)}`,
        JSON.stringify({ status: RawTaskStatus.REVOKED }),
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
   */
  async create(request: TaskRequest): Promise<Task> {
    try {
      const response = await this.axios.post<TaskDTO>(
        `/tasks/`,
        JSON.stringify(this.transform.requestDTO(request)),
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

  private static completeRequest(
    options: ListOptions<TaskFilters>
  ): ListRequest<TaskFilters> {
    return Object.assign(
      {
        limit: 1000,
        offset: 0,
        filters: {},
        fields: [],
      },
      options
    );
  }
}
