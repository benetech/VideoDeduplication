import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { Relevance } from "../../../state/relevance";
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
    [Relevance.all]: intl.formatMessage({ id: "search.category.all" }),
    [Relevance.duplicates]: intl.formatMessage({
      id: "search.category.duplicates",
    }),
    [Relevance.related]: intl.formatMessage({ id: "search.category.related" }),
    [Relevance.unique]: intl.formatMessage({ id: "search.category.unique" }),
  };
}

const categories = [
  Relevance.all,
  Relevance.duplicates,
  Relevance.related,
  Relevance.unique,
];

const icons = {
  [Relevance.all]: AllInclusiveOutlinedIcon,
  [Relevance.duplicates]: FileCopyOutlinedIcon,
  [Relevance.related]: GroupWorkOutlinedIcon,
  [Relevance.unique]: AdjustOutlinedIcon,
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
    Relevance.all,
    Relevance.duplicates,
    Relevance.related,
    Relevance.unique,
  ]).isRequired,
  counts: PropTypes.shape({
    [Relevance.all]: PropTypes.number.isRequired,
    [Relevance.duplicates]: PropTypes.number.isRequired,
    [Relevance.related]: PropTypes.number.isRequired,
    [Relevance.unique]: PropTypes.number.isRequired,
  }).isRequired,
  dense: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default CategorySelector;
