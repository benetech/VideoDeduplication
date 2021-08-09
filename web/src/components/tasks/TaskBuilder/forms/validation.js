/**
 * Check if optional value is positive.
 */
export function positive(value) {
  return value == null || value > 0;
}

/**
 * Check if optional value is positive.
 */
export function nonNegative(value) {
  return value == null || value >= 0;
}

/**
 * Validate config.
 */
export function validateTaskConfig(config) {
  return (
    positive(config.frameSampling) &&
    nonNegative(config.darkThreshold) &&
    nonNegative(config.matchDist) &&
    nonNegative(config.minDuration)
  );
}
