import React from "react";
import clsx from "clsx";
import { useIntl } from "react-intl";
import CategoryButton from "./CategoryButton";
import AllInclusiveOutlinedIcon from "@material-ui/icons/AllInclusiveOutlined";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import GroupWorkOutlinedIcon from "@material-ui/icons/GroupWorkOutlined";
import AdjustOutlinedIcon from "@material-ui/icons/AdjustOutlined";
import { formatCount } from "../../../lib/helpers/format";
import Grid from "@material-ui/core/Grid";
import { MatchCategory } from "../../../model/VideoFile";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { SvgIconTypeMap } from "@material-ui/core/SvgIcon/SvgIcon";
import { MatchCounts } from "../../../model/Match";

type CategoryButtonDescr = {
  category: MatchCategory;
  title: string;
  icon: OverridableComponent<SvgIconTypeMap>;
  selector: string;
};

/**
 * Selectable categories.
 */
const options: CategoryButtonDescr[] = [
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

function CategorySelector(props: CategorySelectorProps): JSX.Element {
  const { category: selected, onChange, counts, dense, className } = props;
  const intl = useIntl();
  const format = (id: string): string => intl.formatMessage({ id });

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

type CategorySelectorProps = {
  category: MatchCategory;
  counts: MatchCounts;
  dense?: boolean;
  onChange: (category: MatchCategory) => void;
  className?: string;
};

export default CategorySelector;
