import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import lodash from "lodash";
import LazyLoad from "react-lazyload";
import Grid from "@material-ui/core/Grid";
import IconOption from "./IconOption";

const useStyles = makeStyles((theme) => ({
  iconList: {
    overflow: "auto",
    padding: theme.spacing(1),
    height: 74 * 4,
  },
  icon: {
    display: "inline-block",
    margin: theme.spacing(1),
  },
  row: {},
}));

function IconList(props) {
  const { names, selected, onSelect, className, ...other } = props;
  const classes = useStyles();
  const chunks = useMemo(() => lodash.chunk(names, 5), [names]);

  return (
    <div className={clsx(classes.iconList, className)} {...other}>
      {chunks.map((chunk, index) => (
        <LazyLoad key={index} height={74} overflow>
          <div className={classes.row}>
            {chunk.map((option) => (
              <IconOption
                key={option}
                name={option}
                onClick={onSelect}
                selected={selected === option}
                className={classes.icon}
              />
            ))}
          </div>
        </LazyLoad>
      ))}
    </div>
  );
}

IconList.propTypes = {
  /**
   * Icon names to display.
   */
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  /**
   * Selected icon name.
   */
  selected: PropTypes.string,
  /**
   * Icon selection callback.
   */
  onSelect: PropTypes.func,
  className: PropTypes.string,
};

export default IconList;
