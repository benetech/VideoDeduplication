/**
 * @file Defines actions to manage main files collection displayed on the "Collection" root page.
 */
import { FileFilters } from "../../../../model/VideoFile";
import ListType from "../../../../model/ListType";
import { Action } from "redux";

export enum CollActions {
  SET_PARAMS = "files.coll.SET_PARAMS",
  UPDATE_PARAMS = "files.coll.UPDATE_PARAMS",
  SET_BLUR = "files.coll.SET_BLUR",
  SET_LIST_TYPE = "files.coll.SET_LIST_TYPE",
}

export type SetCollParamsAction = {
  type: CollActions.SET_PARAMS;
  params: FileFilters;
};

export type UpdateCollParamsAction = {
  type: CollActions.UPDATE_PARAMS;
  params: Partial<FileFilters>;
};

export type SetCollBlurAction = {
  type: CollActions.SET_BLUR;
  blur: boolean;
};

export type SetCollListTypeAction = {
  type: CollActions.SET_LIST_TYPE;
  listType: ListType;
};

export type CollAction =
  | SetCollParamsAction
  | UpdateCollParamsAction
  | SetCollBlurAction
  | SetCollListTypeAction;

export function isCollAction(action: Action): action is CollAction {
  return Object.values(CollActions).includes(action.type);
}

/**
 * Set collection params.
 */
export function setCollParams(params: FileFilters): SetCollParamsAction {
  return { type: CollActions.SET_PARAMS, params };
}

/**
 * Update collection params.
 *
 * Parameters will be merged with the existing ones.
 */
export function updateCollParams(
  params: Partial<FileFilters>
): UpdateCollParamsAction {
  return { type: CollActions.UPDATE_PARAMS, params };
}

/**
 * Switch blur-all flag.
 */
export function setCollBlur(blur: boolean): SetCollBlurAction {
  return { type: CollActions.SET_BLUR, blur };
}

/**
 * Set files collection list type.
 */
export function setCollListType(listType: ListType): SetCollListTypeAction {
  return { type: CollActions.SET_LIST_TYPE, listType };
}
