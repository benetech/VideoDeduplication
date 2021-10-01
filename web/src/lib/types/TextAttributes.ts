/**
 * Object with same-type attributes.
 */
export type Attributes<TValue> = {
  [key: string]: TValue;
};

/**
 * Object with arbitrary text attributes.
 */
export type TextAttributes = Attributes<string>;
