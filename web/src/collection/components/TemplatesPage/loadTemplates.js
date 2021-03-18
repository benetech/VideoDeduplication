import sleep from "sleep-promise";

async function fibonacciBackoff(request, maxRetry = 10) {
  let [prev, cur] = [1000, 1000];
  for (let i = 0; i < maxRetry; i++) {
    const response = await request();
    if (response.success) {
      console.log("Success!", response);
      return response;
    }
    console.error("Error network request", request.error);
    await sleep(cur);
    [prev, cur] = [cur, cur + prev];
  }
  throw new Error(`Making network request failed after ${maxRetry} attempts`);
}

export default async function loadTemplates(server) {
  let templates = [];
  let total = undefined;
  while (total == null || templates.length < total) {
    let response = await fibonacciBackoff(() =>
      server.fetchTemplates({ offset: templates.length })
    );
    total = response.data.total;
    templates = templates.concat(response.data.templates);
  }
  return templates;
}
