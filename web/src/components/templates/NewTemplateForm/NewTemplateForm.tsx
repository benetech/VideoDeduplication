import React, { useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { TextField, Theme } from "@material-ui/core";
import TemplateIconPreview from "../TemplateList/TemplateIconPreview";
import { Template } from "../../../model/Template";
import { Transient } from "../../../lib/entity/Entity";
import { FieldErrors } from "../../../lib/types/FieldErrors";

const useStyles = makeStyles<Theme>((theme) => ({
  form: {
    display: "flex",
    alignItems: "flex-start",
  },
  icon: {
    width: 40,
    height: 40,
    fontSize: 40,
    margin: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(3),
    minWidth: 250,
    flexGrow: 1,
  },
}));

function NewTemplateForm(props: NewTemplateFormProps): JSX.Element {
  const { template, onChange, errors, className, ...other } = props;
  const classes = useStyles();
  const handleChangeName = useCallback(
    (event) => {
      onChange({ ...template, name: event.target.value });
    },
    [onChange, template]
  );
  const handleChangeIcon = useCallback(
    (icon) => {
      onChange({ ...template, icon });
    },
    [onChange, template]
  );
  return (
    <div className={clsx(classes.form, className)} {...other}>
      <TemplateIconPreview
        onChange={handleChangeIcon}
        icon={template.icon}
        edit
        className={classes.icon}
      />
      <TextField
        value={template.name}
        onChange={handleChangeName}
        className={classes.title}
        color="secondary"
        error={!!errors.name}
        helperText={errors.name}
      />
    </div>
  );
}

type NewTemplateFormProps = {
  template: Transient<Template>;
  onChange: (template: Transient<Template>) => void;
  errors: FieldErrors<Template>;
  className?: string;
};
export default NewTemplateForm;
