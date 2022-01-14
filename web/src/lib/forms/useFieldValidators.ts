import { Errors } from "./handler-types";
import {
  descrEntries,
  DescriptorEntry,
  FormDescriptor,
} from "./descriptor-types";
import { useIntl } from "react-intl";
import { useMemo } from "react";
import { funcComparator } from "../helpers/comparators";

/**
 * Convert form descriptor to array of validators that checks individual fields.
 *
 * Result array is ordered according to the `FieldDescriptor.order` attribute.
 */
export function useFieldValidators<Fields>(
  descriptor: FormDescriptor<Fields>
): ((fields: Fields) => Errors<Fields>)[] {
  const intl = useIntl();
  return useMemo(() => {
    const sortedEntries = descrEntries(descriptor).sort(
      funcComparator((entry) => entry[1].order)
    );
    return sortedEntries.map((entry: DescriptorEntry<Fields>) => {
      const [attrName, descriptor] = entry;
      const displayName = intl.formatMessage({ id: descriptor.name });
      return (fields: Fields): Errors<Fields> => {
        const updates = descriptor.update(
          String(fields[attrName]),
          fields[attrName],
          null,
          displayName,
          intl
        );
        const errors: Errors<Fields> = {};
        if (updates.error != null) {
          errors[attrName] = updates.error;
        }
        return errors;
      };
    });
  }, [intl, descriptor]);
}
