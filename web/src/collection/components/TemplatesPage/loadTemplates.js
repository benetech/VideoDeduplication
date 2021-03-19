export default async function loadTemplates(server) {
  let templates = [];
  let total = undefined;
  while (total == null || templates.length < total) {
    let response = await server.fetchTemplates({ offset: templates.length });
    if (!response.success) {
      throw response.error;
    }
    total = response.data.total;
    templates = templates.concat(response.data.templates);
  }
  return templates;
}
