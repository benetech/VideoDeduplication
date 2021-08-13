import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { MatchCategory } from "../../../prop-types/MatchCategory";
import CategoryButton from "./CategoryButton";
import AllInclusiveOutlinedIcon from "@material-ui/icons/AllInclusiveOutlined";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import GroupWorkOutlinedIcon from "@material-ui/icons/GroupWorkOutlined";
import AdjustOutlinedIcon from "@material-ui/icons/AdjustOutlined";
import { formatCount } from "../../../lib/helpers/format";
import Grid from "@material-ui/core/Grid";

/**
 * Selectable categories.
 */
const options = [
  {
    category: MatchCategory.all,
    title: "search.category.all",
    icon: AllInclusiveOutlinedIcon,
    selector: "ShowAllButton",
  },
  {
    category: MatchCategory.duplicates,
    title: "search.category.duplicates",
    icon: FileCopyOutlinedIcon,
    selector: "ShowDuplicatesButton",
  },
  {
    category: MatchCategory.related,
    title: "search.category.related",
    icon: GroupWorkOutlinedIcon,
    selector: "ShowRelatedButton",
  },
  {
    category: MatchCategory.unique,
    title: "search.category.unique",
    icon: AdjustOutlinedIcon,
    selector: "ShowUniqueButton",
  },
];

function CategorySelector(props) {
  const { category: selected, onChange, counts, dense, className } = props;
  const intl = useIntl();
  const format = (id) => intl.formatMessage({ id });

  return (
    <Grid
      container
      spacing={2}
      className={clsx(className)}
      role="listbox"
      aria-label={format("aria.label.categorySelector")}
    >
      {options.map((option) => (
        <CategoryButton
          name={format(option.title)}
          icon={option.icon}
          quantity={formatCount(counts[option.category])}
          onClick={() => onChange(option.category)}
          selected={option.category === selected}
          key={option.category}
          dense={dense}
          data-selector={option.selector}
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
