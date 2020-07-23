import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Label from "./Label";
import SelectionDecorator from "./SelectionDecorator";

const useStyles = makeStyles((theme) => ({
  link: {
    padding: 4,
    paddingBottom: 10,
    cursor: "pointer",
    transform: "translate(0%, 0px)",
  },
}));

function HeaderLink(props) {
  const { title, selected, onClick, className } = props;
  const classes = useStyles();

  const decorator = selected ? <SelectionDecorator variant="bottom" /> : null;

  return (
    <div className={clsx(classes.link, className)} onClick={onClick}>
      <Label
        variant="navlink"
        bold={selected}
        color={selected ? "primary" : "black"}
      >
        {title}
      </Label>
      {decorator}
    </div>
  );
}

HeaderLink.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  className: PropTypes.string,
};

export default HeaderLink;
