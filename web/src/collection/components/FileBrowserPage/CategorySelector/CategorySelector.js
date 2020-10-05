import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { MatchCategory } from "../../../state/MatchCategory";
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
    [MatchCategory.all]: intl.formatMessage({ id: "search.category.all" }),
    [MatchCategory.duplicates]: intl.formatMessage({
      id: "search.category.duplicates",
    }),
    [MatchCategory.related]: intl.formatMessage({
      id: "search.category.related",
    }),
    [MatchCategory.unique]: intl.formatMessage({
      id: "search.category.unique",
    }),
  };
}

const categories = [
  MatchCategory.all,
  MatchCategory.duplicates,
  MatchCategory.related,
  MatchCategory.unique,
];

const icons = {
  [MatchCategory.all]: AllInclusiveOutlinedIcon,
  [MatchCategory.duplicates]: FileCopyOutlinedIcon,
  [MatchCategory.related]: GroupWorkOutlinedIcon,
  [MatchCategory.unique]: AdjustOutlinedIcon,
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
    MatchCategory.all,
    MatchCategory.duplicates,
    MatchCategory.related,
    MatchCategory.unique,
  ]).isRequired,
  counts: PropTypes.shape({
    [MatchCategory.all]: PropTypes.number.isRequired,
    [MatchCategory.duplicates]: PropTypes.number.isRequired,
    [MatchCategory.related]: PropTypes.number.isRequired,
    [MatchCategory.unique]: PropTypes.number.isRequired,
  }).isRequired,
  dense: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default CategorySelector;
