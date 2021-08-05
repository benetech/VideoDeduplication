/**
 * Load all templates.
 * @param {Server} server
 * @return {Promise<Template[]>}
 */
export default async function loadTemplates(server) {
  let templates = [];
  let total = undefined;
  while (total == null || templates.length < total) {
    const fetched = await server.templates.list({ offset: templates.length });
    total = fetched.total;
    templates = templates.concat(fetched.templates);
  }
  return templates;
}
