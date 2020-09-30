import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TextField from "@material-ui/core/TextField";

/**
 * Classes of underlying input element.
 */
const useInputStyles = makeStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
    border: "none",
    backgroundColor: "#EBEBEB",
    borderRadius: 4,
  },
  input: {
    borderRadius: 4,
    position: "relative",
    border: "none",
    fontSize: 16,
    width: "auto",
    padding: "10px 12px",
    fontFamily: "Roboto",
    color: (props) =>
      props.error ? theme.palette.error.main : theme.palette.common.black,
  },
}));

/**
 * Classes of underlying label element.
 */
const useLabelStyles = makeStyles((theme) => ({
  root: {
    color: (props) =>
      props.error ? theme.palette.error.main : theme.palette.common.black,
    "&$focused": {
      color: (props) =>
        props.error ? theme.palette.error.main : theme.palette.common.black,
    },
    "&$disabled": {
      color: theme.palette.text.disabled,
    },
    "&$error": {
      color: theme.palette.error.main,
    },
  },
  focused: {
    color: (props) =>
      props.error ? theme.palette.error.main : theme.palette.common.black,
  },
}));

/**
 * Styled wrapper around MUI InputBase with label on top of the input.
 */
function TopLabelTextField(props) {
  const labelClasses = useLabelStyles(props);
  const inputClasses = useInputStyles(props);
  const { InputLabelProps, InputProps, ...restProps } = props;
  return (
    <TextField
      {...restProps}
      InputLabelProps={{
        ...InputLabelProps,
        shrink: true,
        classes: labelClasses,
      }}
      InputProps={{
        ...InputProps,
        classes: inputClasses,
        disableUnderline: true,
      }}
    />
  );
}

TopLabelTextField.propTypes = {
  /*
   * Below is a copy-paste from MUI InputBase element.
   */
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  color: PropTypes.oneOf(["primary", "secondary"]),
  defaultValue: PropTypes.any,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  FormHelperTextProps: PropTypes.object,
  fullWidth: PropTypes.bool,
  helperText: PropTypes.node,
  hiddenLabel: PropTypes.bool,
  id: PropTypes.string,
  InputLabelProps: PropTypes.object,
  inputProps: PropTypes.object,
  InputProps: PropTypes.object,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  label: PropTypes.node,
  margin: PropTypes.oneOf(["dense", "none", "normal"]),
  multiline: PropTypes.bool,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rowsMax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  select: PropTypes.bool,
  SelectProps: PropTypes.object,
  size: PropTypes.oneOf(["medium", "small"]),
  type: PropTypes.string,
  value: PropTypes.any,
  variant: PropTypes.oneOf(["filled", "outlined", "standard"]),
};

export default TopLabelTextField;
