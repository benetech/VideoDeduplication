import { pickRandom } from "./helpers";
import TaskRequest from "../../../application/state/tasks/TaskRequest";
import { randomName } from "./files";

function randomRequest() {
  const request = {
    type: pickRandom([TaskRequest.DIRECTORY, TaskRequest.FILE_LIST]),
  };

  if (request.type === TaskRequest.DIRECTORY) {
    request.directory = `yt2020/collection-${Math.floor(Math.random() * 100)}`;
  } else if (request.type === TaskRequest.FILE_LIST) {
    const count = Math.floor(500 * Math.random());
    const files = [];
    for (let i = 0; i < count; i++) {
      files.push(randomName());
    }
    request.files = files;
  }
  return request;
}

function* taskRange({ id, timer, status, count }) {
  const timeStep = 10 * 60 * 1000; // 10 minutes
  for (let i = 0; i < count; i++) {
    yield {
      id: id++,
      submissionTime: new Date(timer.time),
      statusUpdateTime: new Date(timer.time),
      status: status,
      request: randomRequest(),
      progress: status === "RUNNING" ? Math.random() : undefined,
    };
    timer.time -= timeStep * Math.random();
  }
}

/**
 * Generate random tasks.
 */
export function randomTasks({
  pending = 0,
  running = 0,
  success = 0,
  failure = 0,
  cancelled = 0,
}) {
  const timer = { time: Date.now() };
  return [
    ...taskRange({ id: 0, timer, status: "PENDING", count: pending }),
    ...taskRange({ id: pending, timer, status: "RUNNING", count: running }),
    ...taskRange({
      id: pending + running,
      timer,
      status: "FAILURE",
      count: failure,
    }),
    ...taskRange({
      id: pending + running + failure,
      timer,
      status: "SUCCESS",
      count: success,
    }),
    ...taskRange({
      id: pending + running + failure + success,
      timer,
      status: "CANCELLED",
      count: cancelled,
    }),
  ];
}

export function randomTask({ id = null, status = "RUNNING" }) {
  return {
    id: id || "42",
    submissionTime: new Date(),
    statusUpdateTime: new Date(),
    status: status,
    request: randomRequest(),
    progress: status === "RUNNING" ? Math.random() : undefined,
  };
}
