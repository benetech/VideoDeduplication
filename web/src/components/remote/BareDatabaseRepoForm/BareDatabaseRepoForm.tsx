import React, { useCallback, useState } from "react";
import { InputLabel, OutlinedInput, TextField } from "@material-ui/core";
import { useIntl } from "react-intl";
import useUniqueId from "../../../lib/hooks/useUniqueId";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from "@material-ui/icons/VisibilityOutlined";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOffOutlined";
import useFields from "../../../lib/forms/useFields";
import { Errors } from "../../../lib/forms/handler-types";
import {
  BareDatabaseRepoFields,
  BareDatabaseRepoFormDescriptor,
} from "./BareDatabaseRepoFields";

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    passVisibility: intl.formatMessage({ id: "actions.changePassVisibility" }),
  };
}

type BareDatabaseRepoFormProps = {
  errors: Errors<BareDatabaseRepoFields>;
  fields: BareDatabaseRepoFields;
  onFieldsChange: (fields: BareDatabaseRepoFields) => void;
  onErrorsChange: (errors: Errors<BareDatabaseRepoFields>) => void;
  className?: string;
};

export default function BareDatabaseRepoForm(
  props: BareDatabaseRepoFormProps
): JSX.Element {
  const { fields, errors, onFieldsChange, onErrorsChange, className } = props;
  const messages = useMessages();
  const passFieldId = useUniqueId("password");

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPass = useCallback(
    () => setShowPassword(!showPassword),
    [showPassword]
  );

  const handler = useFields(
    BareDatabaseRepoFormDescriptor,
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
        <Grid item xs={6}>
          <TextField
            required={handler.host.required}
            label={handler.host.name}
            variant="outlined"
            color="secondary"
            value={fields.host}
            onChange={handler.host.onChange}
            error={Boolean(errors.host)}
            helperText={errors.host}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            required={handler.port.required}
            label={handler.port.name}
            type="number"
            variant="outlined"
            color="secondary"
            value={`${fields.port}`}
            onChange={handler.port.onChange}
            error={Boolean(errors.port)}
            helperText={errors.port}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required={handler.databaseName.required}
            label={handler.databaseName.name}
            variant="outlined"
            color="secondary"
            value={fields.databaseName}
            onChange={handler.databaseName.onChange}
            error={Boolean(errors.databaseName)}
            helperText={errors.databaseName}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            required={handler.login.required}
            label={handler.login.name}
            variant="outlined"
            color="secondary"
            value={fields.login}
            onChange={handler.login.onChange}
            error={Boolean(errors.login)}
            helperText={errors.login}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl
            color="secondary"
            variant="outlined"
            required={handler.password.required}
            fullWidth
          >
            <InputLabel htmlFor={passFieldId}>
              {handler.password.name}
            </InputLabel>
            <OutlinedInput
              id={passFieldId}
              type={showPassword ? "text" : "password"}
              value={fields.password}
              onChange={handler.password.onChange}
              error={Boolean(errors.password)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={messages.passVisibility}
                    onClick={toggleShowPass}
                    onMouseDown={toggleShowPass}
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              }
              labelWidth={75}
            />
          </FormControl>
        </Grid>
      </Grid>
    </div>
  );
}
