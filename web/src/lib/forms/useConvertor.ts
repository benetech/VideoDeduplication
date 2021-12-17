import { Errors } from "./handler-types";

export interface FieldConvertor<TFrom, TTo> {
  convert(dataFrom: TFrom, errorsFrom: Errors<TFrom>): [TTo, Errors<TTo>];
  reverse(dataTo: TTo, errorsTo: Errors<TTo>): [TFrom, Errors<TFrom>];
}

export default function useFieldConvertor<TFrom, TTo>(
  dataFrom: TFrom,
  errorsFrom: Errors<TFrom>,
  dataTo: TTo,
  errorsTo: Errors<TTo>,
  convertor: FieldConvertor<TFrom, TTo>
) {
  return {
    onErrors() {},
  };
}
