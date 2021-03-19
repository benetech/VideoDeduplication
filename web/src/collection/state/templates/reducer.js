import lodash from "lodash";
import initialState from "./initialState";
import {
  ACTION_ADD_EXAMPLE,
  ACTION_ADD_TEMPlATES,
  ACTION_DELETE_EXAMPLE,
  ACTION_DELETE_TEMPLATE,
  ACTION_SET_TEMPLATES,
  ACTION_UPDATE_TEMPLATE,
} from "./actions";
import extendEntityList from "../helpers/extendEntityList";

function templateReducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_ADD_TEMPlATES:
      return {
        ...state,
        templates: extendEntityList(state.templates, action.templates),
      };
    case ACTION_SET_TEMPLATES:
      return {
        ...state,
        templates: [...action.templates],
      };
    case ACTION_UPDATE_TEMPLATE: {
      const updatedTemplates = state.templates.map((template) => {
        if (template.id === action.template.id) {
          return lodash.merge({}, template, action.template);
        }
        return template;
      });
      return {
        ...state,
        templates: updatedTemplates,
      };
    }
    case ACTION_DELETE_TEMPLATE:
      return {
        ...state,
        templates: state.templates.filter(
          (template) => template.id !== action.id
        ),
      };
    case ACTION_ADD_EXAMPLE: {
      const updateTemplates = state.templates.map((template) => {
        if (template.id !== action.example.templateId) {
          return template;
        }
        return {
          ...template,
          examples: extendEntityList(template.examples, [action.example]),
        };
      });
      return {
        ...state,
        templates: updateTemplates,
      };
    }
    case ACTION_DELETE_EXAMPLE: {
      const updateTemplates = state.templates.map((template) => ({
        ...template,
        examples: template.examples.filter(
          (example) => example.id !== action.id
        ),
      }));
      return {
        ...state,
        templates: updateTemplates,
      };
    }
    default:
      return state;
  }
}

export default templateReducer;
