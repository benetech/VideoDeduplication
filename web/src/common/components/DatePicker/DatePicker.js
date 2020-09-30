import React, { useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import TopLabelTextField from "../TopLabelTextField";

const useStyles = makeStyles((theme) => ({
  root: {
    height: 200,
    width: 200,
  },
}));

function DatePicker(props) {
  const { className } = props;
  const classes = useStyles();
  const [date, setDate] = useState(null);
  return (
    <div className={clsx(classes.root, className)}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="From"
          value={date}
          onChange={setDate}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          TextFieldComponent={TopLabelTextField}
        />
      </MuiPickersUtilsProvider>
    </div>
  );
}

DatePicker.propTypes = {
  className: PropTypes.string,
};

export default DatePicker;
