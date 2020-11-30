import fileClusterReducer from "./reducer";
import initialState from "./initialState";
import {
  fetchFileClusterSlice,
  fetchFileClusterSliceSuccess,
  updateFileClusterParams,
} from "./actions";

describe(fileClusterReducer, () => {
  test("Updates files on success", () => {
    const initial = { ...initialState };
    const update = updateFileClusterParams({ fileId: 1 });
    const withParams = fileClusterReducer(initial, update);
    expect(withParams.params).toMatchObject(update.params);

    const fetch = fetchFileClusterSlice();
    const whileFetching = fileClusterReducer(withParams, fetch);
    expect(whileFetching).toMatchObject({ loading: true, error: false });

    const success = fetchFileClusterSliceSuccess({
      data: {
        matches: [{ id: 1 }],
        files: [{ id: 1 }],
      },
      params: update.params,
    });
    const afterFetch = fileClusterReducer(whileFetching, success);
    expect(afterFetch).toMatchObject({ loading: false, error: false });
    expect(afterFetch.matches).toMatchObject(success.data.matches);
    expect(afterFetch.files).toMatchObject({ 1: { id: 1 } });
  });

  test("Ignores irrelevant response", () => {
    const initial = {
      ...initialState,
      params: { ...initialState.params, fileId: 42 },
      loading: true,
    };
    const success = fetchFileClusterSliceSuccess({
      data: {
        matches: [{ id: 1 }],
        files: [{ id: 1 }],
      },
      params: {
        fileId: initial.params.fileId + 1,
      },
    });
    const result = fileClusterReducer({ ...initial }, success);
    expect(result).toEqual(initial);
  });
});
