import { FormDescriptor } from "../../../lib/forms/descriptor-types";
import { reqInteger, reqString } from "../../../lib/forms/field-descriptrs";
import useLazyValidator from "../../../lib/forms/useLazyValidator";
import { Errors } from "../../../lib/forms/handler-types";

/**
 * Bare-Database repository form fields.
 */
export type BareDatabaseRepoFields = {
  name: string;
  host: string;
  port: number;
  databaseName: string;
  login: string;
  password: string;
};

export const BareDatabaseRepoFormDescriptor: FormDescriptor<BareDatabaseRepoFields> =
  {
    name: reqString("repos.attr.name", {
      minLength: 3,
      maxLength: 250,
      pattern: /^[\w][\w -]*$/,
      order: 0,
    }),
    host: reqString("repos.attr.host", { maxLength: 250, order: 1 }),
    port: reqInteger("repos.attr.port", { min: 0, max: 65535, order: 2 }),
    databaseName: reqString("repos.attr.dbName", { maxLength: 250, order: 3 }),
    login: reqString("repos.attr.login", { maxLength: 250, order: 4 }),
    password: reqString("repos.attr.password", { maxLength: 250, order: 5 }),
  };

export const DefaultBareDatabaseRepoFields: BareDatabaseRepoFields = {
  name: "",
  host: "",
  port: 5432,
  databaseName: "",
  login: "",
  password: "",
};

type DBRepoFieldsValidator = (
  fields: BareDatabaseRepoFields
) => Errors<BareDatabaseRepoFields>;

/**
 * Bare-Database repository fields lazy validator.
 */
export function useValidateDBRepoFields(): DBRepoFieldsValidator {
  return useLazyValidator(BareDatabaseRepoFormDescriptor);
}
