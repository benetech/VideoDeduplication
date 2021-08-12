import lodash from "lodash";
import initialState from "./initialState";
import {
  ACTION_ACQUIRE_TEMPLATES_QUERY,
  ACTION_QUERY_TEMPLATES,
  ACTION_RELEASE_TEMPLATES_QUERY,
  ACTION_TEMPLATES_QUERY_FAILED,
  ACTION_UPDATE_TEMPLATES_QUERY,
} from "./actions";
import {
  ACTION_ADD_EXAMPLE,
  ACTION_ADD_TEMPLATE,
  ACTION_DELETE_EXAMPLE,
  ACTION_DELETE_TEMPLATE,
  ACTION_UPDATE_TEMPLATE,
} from "../common/actions";
import {
  queryCacheReducer,
  queryFailed,
  queryItems,
  releaseQuery,
  updateQuery,
  useQuery,
} from "../../../common/queryCache";
import { stringComparator } from "../../../../lib/helpers/comparators";
import {
  addEntity,
  deleteEntity,
  updateEntity,
} from "../../../common/queryCache/reducer";
import { addExample, delExample } from "../common/updaters";

/**
 * Check if the template satisfies query params.
 * @param {TemplateFilters} params
 * @param {TemplateType} template
 * @return {boolean}
 */
function checkFilters(params, template) {
  return template.name.toLowerCase().includes(params.name || "");
}

/**
 * Compare template by names.
 * @param {TemplateType} templateA
 * @param {TemplateType} templateB
 * @return {number}
 */
function nameComparator(templateA, templateB) {
  return stringComparator(templateA.name, templateB.name);
}

/**
 * Create template sort comparator from query params.
 * @return {function}
 */
function makeComparator() {
  return nameComparator;
}

/**
 * Templates query cache reducer.
 *
 * @param {QueryCache} state
 * @param {TemplatesQueryAction|TemplateAction} action
 * @return {QueryCache}
 */
export default function templatesQueryReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_QUERY_TEMPLATES:
      return queryCacheReducer(
        state,
        queryItems(action.params, action.request)
      );
    case ACTION_UPDATE_TEMPLATES_QUERY:
      return queryCacheReducer(
        state,
        updateQuery({
          params: action.params,
          items: action.templates,
          total: action.total,
          request: action.request,
        })
      );
    case ACTION_TEMPLATES_QUERY_FAILED:
      return queryCacheReducer(
        state,
        queryFailed(action.params, action.request)
      );
    case ACTION_ACQUIRE_TEMPLATES_QUERY:
      return queryCacheReducer(state, useQuery(action.params));
    case ACTION_RELEASE_TEMPLATES_QUERY:
      return queryCacheReducer(state, releaseQuery(action.params));
    case ACTION_ADD_TEMPLATE:
      return addEntity(state, action.template, checkFilters, makeComparator);
    case ACTION_DELETE_TEMPLATE:
      return deleteEntity(state, action.template);
    case ACTION_UPDATE_TEMPLATE: {
      const updates = action.template;
      const updater = (existing) => lodash.merge({}, existing, updates);
      return updateEntity(
        state,
        updates,
        updater,
        checkFilters,
        makeComparator
      );
    }
    case ACTION_ADD_EXAMPLE: {
      const example = action.example;
      const template = example.templateId;
      const updater = (existing) => addExample(existing, example);
      return updateEntity(
        state,
        template,
        updater,
        checkFilters,
        makeComparator
      );
    }
    case ACTION_DELETE_EXAMPLE: {
      const example = action.example;
      const template = example.templateId;
      const updater = (existing) => delExample(existing, example);
      return updateEntity(
        state,
        template,
        updater,
        checkFilters,
        makeComparator
      );
    }
    default:
      return state;
  }
}
