import initialState from "./initialState";
import {
  ACTION_ADD_EXAMPLE,
  ACTION_ADD_TEMPLATE,
  ACTION_DELETE_EXAMPLE,
  ACTION_DELETE_TEMPLATE,
  ACTION_UPDATE_TEMPLATE,
} from "../common/actions";
import {
  cacheValue,
  deleteEntry,
  entityCacheReducer,
  updateFunc,
  updateValue,
} from "../../../common/cache";
import { addExample, delExample } from "../common/updaters";
import getEntityId from "../../../../lib/helpers/getEntityId";

/**
 * Individual templates cache.
 * @param {ValueCache} state
 * @param {TemplateAction} action
 * @return {ValueCache}
 */
export default function templateCacheReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_ADD_TEMPLATE: {
      const template = action.template;
      return entityCacheReducer(state, cacheValue(template.id, template));
    }
    case ACTION_DELETE_TEMPLATE: {
      const cacheKey = getEntityId(action.template);
      return entityCacheReducer(state, deleteEntry(cacheKey));
    }
    case ACTION_UPDATE_TEMPLATE: {
      const template = action.template;
      return entityCacheReducer(state, updateValue(template.id, template));
    }
    case ACTION_ADD_EXAMPLE: {
      const example = action.example;
      return updateFunc(state, example.templateId, (template) =>
        addExample(template, example)
      );
    }
    case ACTION_DELETE_EXAMPLE: {
      const example = action.example;
      return updateFunc(state, example.templateId, (template) =>
        delExample(template, example)
      );
    }
    default:
      return state;
  }
}
