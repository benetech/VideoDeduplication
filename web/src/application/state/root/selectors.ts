import { AppState } from "./initialState";
import { CollState } from "../files/coll/initialState";

// File selectors
export const selectFilesColl = (state: AppState): CollState => state.files.coll;
