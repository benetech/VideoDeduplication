export default async function loadTemplates(server) {
  let templates = [];
  let total = undefined;
  while (total == null || templates.length < total) {
    const fetched = await server.fetchTemplates({ offset: templates.length });
    total = fetched.total;
    templates = templates.concat(fetched.templates);
  }
  return templates;
}
