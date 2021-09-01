import React, { useCallback } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TemplateIconPreview from "../TemplateList/TemplateIconPreview";
import { TextField } from "@material-ui/core";
import { TemplateIconType } from "../../../prop-types/TemplateType";

const useStyles = makeStyles((theme) => ({
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

function NewTemplateForm(props) {
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

NewTemplateForm.propTypes = {
  template: PropTypes.shape({
    icon: TemplateIconType,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};

export default NewTemplateForm;
