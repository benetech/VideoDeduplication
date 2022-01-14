import React from "react";
import { TextField } from "@material-ui/core";
import { Errors } from "../../../lib/forms/handler-types";
import { RepoEditorDescriptor, RepoEditorFields } from "./RepoEditorFields";
import Grid from "@material-ui/core/Grid";
import useFields from "../../../lib/forms/useFields";

type RepoEditorFormProps = {
  errors: Errors<RepoEditorFields>;
  fields: RepoEditorFields;
  onFieldsChange: (fields: RepoEditorFields) => void;
  onErrorsChange: (errors: Errors<RepoEditorFields>) => void;
  className?: string;
};

function RepoEditorForm(props: RepoEditorFormProps): JSX.Element {
  const { fields, onFieldsChange, errors, onErrorsChange, className } = props;

  const handler = useFields(
    RepoEditorDescriptor,
    fields,
    errors,
    onFieldsChange,
    onErrorsChange
  );

  return (
    <div className={className}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required={handler.name.required}
            label={handler.name.name}
            variant="outlined"
            color="secondary"
            value={fields.name}
            onChange={handler.name.onChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default RepoEditorForm;
