import { FormDescriptor } from "../../../lib/forms/descriptor-types";
import { reqString } from "../../../lib/forms/field-descriptrs";
import useLazyValidator from "../../../lib/forms/useLazyValidator";
import { Errors } from "../../../lib/forms/handler-types";

/**
 * Repository editor fields.
 */
export type RepoEditorFields = {
  name: string;
};

export const RepoEditorDescriptor: FormDescriptor<RepoEditorFields> = {
  name: reqString("repos.attr.name", {
    minLength: 3,
    maxLength: 250,
    pattern: /^[\w][\w -]*$/,
  }),
};

type RepoEditorValidator = (
  fields: RepoEditorFields
) => Errors<RepoEditorFields>;

/**
 * Repo editor lazy validator.
 */
export function useValidateRepoEditor(): RepoEditorValidator {
  return useLazyValidator(RepoEditorDescriptor);
}
