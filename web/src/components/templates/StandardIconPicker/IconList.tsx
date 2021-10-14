import React, { useMemo } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import lodash from "lodash";
import LazyLoad from "react-lazyload";
import IconOption from "./IconOption";

const useStyles = makeStyles<Theme>((theme) => ({
  iconList: {
    overflow: "auto",
    padding: theme.spacing(1),
    height: 74 * 2 + theme.spacing(1),
  },
  icon: {
    margin: theme.spacing(1),
  },
  row: {},
}));

function IconList(props: IconListProps): JSX.Element {
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

type IconListProps = {
  /**
   * Icon names to display.
   */
  names: string[];

  /**
   * Selected icon name.
   */
  selected?: string;

  /**
   * Icon selection callback.
   */
  onSelect: (name: string) => void;
  className?: string;
};
export default IconList;
