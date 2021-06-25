import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import SquaredIconButton from "../../../common/components/SquaredIconButton";
import TuneOutlinedIcon from "@material-ui/icons/TuneOutlined";
import HeightOutlinedIcon from "@material-ui/icons/HeightOutlined";
import PeriodPicker, { Period } from "./PeriodPicker";

const useStyles = makeStyles((theme) => ({
  buttonPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  buttonGroup: {
    marginLeft: theme.spacing(1),
  },
  button: {
    flexShrink: 0,
    textTransform: "none",
  },
}));

function ButtonPanel(props) {
  const { onPeriodChange, onExpand, onTune, period, dateRange, className } =
    props;

  const classes = useStyles();

  return (
    <div className={clsx(classes.buttonPanel, className)}>
      <Button
        variant="outlined"
        className={clsx(classes.button, classes.buttonGroup)}
      >
        {dateRange}
      </Button>
      <PeriodPicker
        period={period}
        onChange={onPeriodChange}
        className={classes.buttonGroup}
      />
      <SquaredIconButton
        variant="outlined"
        onClick={onTune}
        className={clsx(classes.button, classes.buttonGroup)}
      >
        <TuneOutlinedIcon />
      </SquaredIconButton>
      <SquaredIconButton
        variant="outlined"
        onClick={onExpand}
        className={clsx(classes.button, classes.buttonGroup)}
      >
        <HeightOutlinedIcon />
      </SquaredIconButton>
    </div>
  );
}

ButtonPanel.propTypes = {
  onTune: PropTypes.func,
  onExpand: PropTypes.func,
  dateRange: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func,
  period: PropTypes.oneOf([Period.day, Period.week, Period.month]).isRequired,
  className: PropTypes.string,
};

export default ButtonPanel;
