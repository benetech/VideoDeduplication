import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { useIntl } from "react-intl";
import { Category } from "./category";
import CategoryButton from "./CategoryButton";
import AllInclusiveOutlinedIcon from "@material-ui/icons/AllInclusiveOutlined";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import GroupWorkOutlinedIcon from "@material-ui/icons/GroupWorkOutlined";
import AdjustOutlinedIcon from "@material-ui/icons/AdjustOutlined";

const useStyles = makeStyles((theme) => ({
  selector: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    marginRight: -theme.spacing(2),
  },
  button: {
    flexGrow: 1,
    marginBottom: theme.spacing(2),
  },
  margin: {
    marginRight: theme.spacing(2),
  },
}));

function useNames() {
  const intl = useIntl();
  return {
    [Category.all]: intl.formatMessage({ id: "search.category.all" }),
    [Category.duplicates]: intl.formatMessage({
      id: "search.category.duplicates",
    }),
    [Category.related]: intl.formatMessage({ id: "search.category.related" }),
    [Category.unique]: intl.formatMessage({ id: "search.category.unique" }),
  };
}

const categories = [
  Category.all,
  Category.duplicates,
  Category.related,
  Category.unique,
];

const icons = {
  [Category.all]: AllInclusiveOutlinedIcon,
  [Category.duplicates]: FileCopyOutlinedIcon,
  [Category.related]: GroupWorkOutlinedIcon,
  [Category.unique]: AdjustOutlinedIcon,
};

function SearchCategorySelector(props) {
  const { category: selected, onChange, className } = props;
  const classes = useStyles();
  const names = useNames();

  return (
    <div className={clsx(classes.selector, className)}>
      {categories.map((category) => (
        <CategoryButton
          name={names[category]}
          icon={icons[category]}
          quantity="9M+"
          onClick={() => onChange(category)}
          selected={category === selected}
          className={clsx(classes.button, classes.margin)}
          key={category}
        />
      ))}
    </div>
  );
}

SearchCategorySelector.propTypes = {
  category: PropTypes.oneOf([
    Category.all,
    Category.duplicates,
    Category.related,
    Category.unique,
  ]).isRequired,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default SearchCategorySelector;
