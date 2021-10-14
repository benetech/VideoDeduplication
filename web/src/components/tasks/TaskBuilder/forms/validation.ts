import { TaskConfig } from "../../../../model/Task";

/**
 * Check if optional value is positive.
 */
export function positive(value?: number | null): boolean {
  return value == null || value > 0;
}

/**
 * Check if optional value is positive.
 */
export function nonNegative(value?: number | null): boolean {
  return value == null || value >= 0;
}

/**
 * Validate config.
 */
export function validateTaskConfig(config: TaskConfig): boolean {
  return (
    positive(config.frameSampling) &&
    nonNegative(config.darkThreshold) &&
    nonNegative(config.matchDistance) &&
    nonNegative(config.minDuration)
  );
}
