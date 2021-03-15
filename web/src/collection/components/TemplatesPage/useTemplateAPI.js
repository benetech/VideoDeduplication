import lodash from "lodash";
import { useCallback, useState } from "react";
import { randomId } from "../../../server-api/MockServer/fake-data/helpers";

function applyChanges(template, updated) {
  if (template.id === updated.id) {
    return lodash.merge({}, template, updated);
  } else {
    return template;
  }
}

function deleteExample(template, deleted) {
  if (template.id === deleted.templateId) {
    const examples = template.examples.filter(
      (example) => example.id !== deleted.id
    );
    return lodash.merge({}, template, { examples });
  } else {
    return template;
  }
}

export default function useTemplateAPI(initialTemplates) {
  const [templates, setTemplates] = useState(initialTemplates);

  const onChange = useCallback(
    (updated) =>
      setTemplates(
        templates.map((template) => applyChanges(template, updated))
      ),
    [templates]
  );

  const onDeleteExample = useCallback(
    (example) =>
      setTemplates(
        templates.map((template) => deleteExample(template, example))
      ),
    [templates]
  );

  const onAddExamples = console.log;

  const onAddTemplate = useCallback(
    () =>
      setTemplates([
        ...templates,
        {
          id: randomId(),
          name: "Template Title",
          icon: null,
          examples: [],
        },
      ]),
    [templates]
  );

  return { templates, onChange, onDeleteExample, onAddExamples, onAddTemplate };
}
