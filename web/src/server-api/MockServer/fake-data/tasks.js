function* taskRange({ id, timer, status, count }) {
  const timeStep = 10 * 60 * 1000; // 10 minutes
  for (let i = 0; i < count; i++) {
    yield {
      id: id++,
      submissionTime: new Date(timer.time),
      lastUpdateTime: new Date(timer.time),
      status: status,
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
