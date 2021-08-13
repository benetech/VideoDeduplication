import lodash from "lodash";

/**
 * Resolve target value.
 * @param {*} value
 * @param {function|Object|undefined} override
 * @return {*}
 */
export default function resolveValue(value, override) {
  if (override == null) {
    return value;
  } else if (lodash.isFunction(override)) {
    return override(value);
  } else {
    return override;
  }
}
