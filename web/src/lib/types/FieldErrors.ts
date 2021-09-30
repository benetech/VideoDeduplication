/**
 * Object field errors.
 *
 * For each field of type `T` there is an optional error message.
 */
export type FieldErrors<T> = {
  [key in keyof T]?: string;
};
