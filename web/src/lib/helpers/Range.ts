/**
 * Some range representation.
 */
export type Range<T = number> = {
  lower: T;
  upper: T;
};

export type PartialRange<T = number> = {
  lower: T | null;
  upper: T | null;
};
