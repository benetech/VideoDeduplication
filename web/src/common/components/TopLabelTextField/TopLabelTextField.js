import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import InputBase from "@material-ui/core/InputBase";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import useUniqueId from "../../hooks/useUniqueId";

const useStyles = makeStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "#EBEBEB",
    border: "none",
    fontSize: 16,
    width: "auto",
    padding: "10px 12px",
    fontFamily: "Roboto",
  },
}));

/**
 * Styled wrapper around MUI InputBase with label on top of the input.
 */
function TopLabelTextField(props) {
  const { label, className, ...restProps } = props;
  const classes = useStyles();
  const inputId = useUniqueId("input");
  return (
    <FormControl className={className}>
      <InputLabel shrink htmlFor={inputId} color={restProps.color}>
        {label}
      </InputLabel>
      <InputBase classes={classes} {...restProps} id={inputId} />
    </FormControl>
  );
}

TopLabelTextField.propTypes = {
  /**
   * Form label.
   */
  label: PropTypes.string.isRequired,
  /*
   * Below is a copy-paste from MUI InputBase element.
   */
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  classes: PropTypes.object,
  className: PropTypes.string,
  color: PropTypes.oneOf(["primary", "secondary"]),
  defaultValue: PropTypes.any,
  disabled: PropTypes.bool,
  endAdornment: PropTypes.node,
  error: PropTypes.bool,
  fullWidth: PropTypes.bool,
  id: PropTypes.string,
  inputComponent: PropTypes.elementType,
  inputProps: PropTypes.object,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  margin: PropTypes.oneOf(["dense", "none"]),
  multiline: PropTypes.bool,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  renderSuffix: PropTypes.func,
  required: PropTypes.bool,
  rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rowsMax: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rowsMin: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  startAdornment: PropTypes.node,
  type: PropTypes.string,
  value: PropTypes.any,
};

export default TopLabelTextField;
