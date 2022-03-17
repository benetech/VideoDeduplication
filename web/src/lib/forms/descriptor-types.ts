import { IntlShape } from "react-intl";

/**
 * Field update result.
 *
 * `FieldDescriptor.update()` must return this type.
 */
type UpdateResult<FieldType> = {
  /**
   * New field value.
   */
  value: FieldType;
  /**
   * Human-readable validation error message.
   */
  error?: string | null;
};

/**
 * Single field descriptor.
 */
export type FieldDescriptor<FieldType> = {
  /**
   * Intl message id for human-readable field name.
   */
  name: string;
  /**
   * Makes field required.
   */
  required: boolean;
  /**
   * Field update logic.
   * @param newValue new value from the `React.SyntheticEvent.target.value`
   * @param currentValue current field value
   * @param currentError current field error
   * @param name human-readable name
   * @param intl intl instance
   */
  update: (
    newValue: string,
    currentValue: FieldType,
    currentError: string | null | undefined,
    name: string,
    intl: IntlShape
  ) => UpdateResult<FieldType>;
  /**
   * Field validation priority in lazy validation.
   */
  order: number;
};

/**
 * Form fields descriptor.
 */
export type FormDescriptor<Fields> = {
  [Field in keyof Fields]: FieldDescriptor<Fields[Field]>;
};

/**
 * Shorthand type for `Object.entries(descriptor)` items.
 */
export type DescriptorEntry<Fields> = [keyof Fields, FieldDescriptor<unknown>];

/**
 * Shorthand function for `Object.entries(descriptor)` with enforced types.
 */
export function descrEntries<Fields>(
  descriptor: FormDescriptor<Fields>
): DescriptorEntry<Fields>[] {
  return Object.entries(descriptor) as DescriptorEntry<Fields>[];
}
