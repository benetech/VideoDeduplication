import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { TextFieldProps } from "@material-ui/core/TextField/TextField";

/**
 * Classes of underlying input element.
 */

const useInputStyles = makeStyles<Theme, TextFieldProps>((theme) => ({
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
    padding: "10px 12px",
    fontFamily: "Roboto",
    color: (props) =>
      props.error ? theme.palette.error.main : theme.palette.common.black,
  },
}));

/**
 * Classes of underlying label element.
 */
const useLabelStyles = makeStyles<Theme, TextFieldProps>((theme) => ({
  root: {
    color: (props) =>
      props.error ? theme.palette.error.main : theme.palette.common.black,
    "&$focused": {
      color: (props) =>
        props.error ? theme.palette.error.main : theme.palette.common.black,
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
export default function TopLabelTextField(props: TextFieldProps): JSX.Element {
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
        // disableUnderline: true,
      }}
    />
  );
}
