import "./makeEntityReducer";
import makeEntityReducer from "./makeEntityReducer";

// Define example collection state.

const initialState = {
  params: {
    someParam: "default",
    otherParam: "default",
  },
  total: undefined,
  error: false,
  loading: false,
  limit: 100,
  items: [],
};

function withItems({ count = 5, total = 10, loading = false, error = false }) {
  return {
    ...initialState,
    total,
    loading,
    error,
    items: rangeItems(0, count),
  };
}

function rangeItems(start, end) {
  const items = [];
  for (let id = start; id < end; id++) {
    items.push({ id });
  }
  return items;
}

function afterFetch({ items, total = 42, params = initialState.params }) {
  return {
    params,
    items,
    loading: true,
    error: false,
    total,
  };
}

const ACTION_UPDATE_PARAMS = "test.UPDATE_PARAMS";
export function updateParams(params, preserveItems = false) {
  return { params, preserveItems, type: ACTION_UPDATE_PARAMS };
}

const ACTION_FETCH = "test.FETCH";
export function fetch() {
  return { type: ACTION_FETCH };
}

const ACTION_FETCH_SUCCESS = "test.FETCH_SUCCESS";
function fetchSuccess({ data, params = initialState.params }) {
  return { data, params, type: ACTION_FETCH_SUCCESS };
}

const ACTION_FETCH_FAILURE = "test.FETCH_FAILURE";
function fetchFailure(error) {
  return { error, type: ACTION_FETCH_FAILURE };
}

// Create example reducer.
const reducer = makeEntityReducer({
  updateParams: ACTION_UPDATE_PARAMS,
  fetchSlice: ACTION_FETCH,
  fetchSliceSuccess: ACTION_FETCH_SUCCESS,
  fetchSliceFailure: ACTION_FETCH_FAILURE,
  initialState: initialState,
  resourceName: "items",
});

describe(makeEntityReducer, () => {
  test("Skip unknown actions", () => {
    const result = reducer({ ...initialState }, { type: "unknown" });
    expect(result).toEqual(initialState);
  });

  test("Updates params", () => {
    const action = updateParams({ someParam: "new-value" });
    const result = reducer({ ...initialState }, action);
    expect(result.params).toMatchObject({
      someParam: "new-value",
      otherParam: "default",
    });
  });

  test("Update params resets collection", () => {
    const initial = withItems({ count: 5 });
    const action = updateParams({ someParam: "new-value" });
    const result = reducer(initial, action);

    expect(result).toMatchObject({
      items: [],
      total: undefined,
      error: false,
      loading: false,
    });
  });

  test("Preserves items on update when params are the same", () => {
    const initial = withItems({ count: 5 });
    const action = updateParams({ someParam: "default" }, true);
    const result = reducer({ ...initial }, action);

    expect(result).toEqual(initial);
  });

  test("Discards items on update when params are different", () => {
    const initial = withItems({ count: 5 });
    const action = updateParams({ someParam: "new-value" }, true);
    const result = reducer({ ...initial }, action);

    expect(result).toMatchObject({
      ...initialState,
      params: {
        someParam: "new-value",
      },
    });
  });

  test("Initiates fetch", () => {
    const initial = withItems({ loading: false, error: true });
    const result = reducer({ ...initial }, fetch());
    expect(result).toMatchObject({
      ...initial,
      loading: true,
      error: false,
    });
  });

  test("Update fetch results", () => {
    const initial = afterFetch({ items: rangeItems(0, 10), total: 20 });
    const action = fetchSuccess({
      data: { items: rangeItems(5, 15), total: 30 },
    });
    const result = reducer({ ...initial }, action);

    expect(result).toMatchObject({
      ...initial,
      items: rangeItems(0, 15),
      total: action.data.total,
      loading: false,
      error: false,
    });
  });

  test("Ignore fetch results if not loading", () => {
    const initial = withItems({ count: 5, loading: false });
    const action = fetchSuccess({
      data: { items: rangeItems(5, 10), total: initial.total + 1 },
    });
    const result = reducer({ ...initial }, action);
    expect(result).toEqual(initial);
  });

  test("Ignore fetch results if params are different", () => {
    const initial = afterFetch({ items: rangeItems(0, 5) });
    const action = fetchSuccess({
      data: { items: rangeItems(5, 10), total: initial.total + 1 },
      params: { someParam: `other than ${initialState.params.someParam}` },
    });
    const result = reducer({ ...initial }, action);
    expect(result).toEqual(initial);
  });

  test("Honors fetch error", () => {
    const initial = afterFetch({ items: rangeItems(0, 5) });
    const action = fetchFailure(new Error());
    const result = reducer(initial, action);
    expect(result).toMatchObject({
      ...initial,
      loading: false,
      error: true,
    });
  });
});
