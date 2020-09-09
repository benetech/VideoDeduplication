import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { Category } from "./category";
import CategoryButton from "./CategoryButton";
import AllInclusiveOutlinedIcon from "@material-ui/icons/AllInclusiveOutlined";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import GroupWorkOutlinedIcon from "@material-ui/icons/GroupWorkOutlined";
import AdjustOutlinedIcon from "@material-ui/icons/AdjustOutlined";
import { formatCount } from "../../../../common/helpers/format";
import Grid from "@material-ui/core/Grid";

function useNames() {
  const intl = useIntl();
  return {
    [Category.total]: intl.formatMessage({ id: "search.category.all" }),
    [Category.duplicates]: intl.formatMessage({
      id: "search.category.duplicates",
    }),
    [Category.related]: intl.formatMessage({ id: "search.category.related" }),
    [Category.unique]: intl.formatMessage({ id: "search.category.unique" }),
  };
}

const categories = [
  Category.total,
  Category.duplicates,
  Category.related,
  Category.unique,
];

const icons = {
  [Category.total]: AllInclusiveOutlinedIcon,
  [Category.duplicates]: FileCopyOutlinedIcon,
  [Category.related]: GroupWorkOutlinedIcon,
  [Category.unique]: AdjustOutlinedIcon,
};

function CategorySelector(props) {
  const { category: selected, onChange, counts, dense, className } = props;
  const names = useNames();
  const intl = useIntl();

  return (
    <Grid
      container
      spacing={2}
      className={clsx(className)}
      role="listbox"
      aria-label={intl.formatMessage({ id: "aria.label.categorySelector" })}
    >
      {categories.map((category) => (
        <CategoryButton
          name={names[category]}
          icon={icons[category]}
          quantity={formatCount(counts[category])}
          onClick={() => onChange(category)}
          selected={category === selected}
          key={category}
          dense={dense}
        />
      ))}
    </Grid>
  );
}

CategorySelector.propTypes = {
  category: PropTypes.oneOf([
    Category.total,
    Category.duplicates,
    Category.related,
    Category.unique,
  ]).isRequired,
  counts: PropTypes.shape({
    [Category.total]: PropTypes.number.isRequired,
    [Category.duplicates]: PropTypes.number.isRequired,
    [Category.related]: PropTypes.number.isRequired,
    [Category.unique]: PropTypes.number.isRequired,
  }).isRequired,
  dense: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default CategorySelector;
