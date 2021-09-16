type TransformFn<Result = any> = (value: any) => Result;

function isTransform<Result>(value: any): value is TransformFn<Result> {
  return typeof value === "function";
}

/**
 * Resolve target value.
 * @param providedValue dynamically provided value
 * @param override optional predefined override value or transform function
 */
export default function resolveValue<Result = any>(
  providedValue: Result | any,
  override?: TransformFn<Result> | Result
): Result {
  if (override == null) {
    return providedValue;
  } else if (isTransform<Result>(override)) {
    return override(providedValue);
  } else {
    return override;
  }
}
