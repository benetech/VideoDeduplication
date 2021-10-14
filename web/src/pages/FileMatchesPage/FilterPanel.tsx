import React, { useCallback } from "react";
import clsx from "clsx";
import lodash from "lodash";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import BoolFilter from "../FileBrowserPage/FilterPane/BoolFilter";
import { useIntl } from "react-intl";
import { MatchQueryFilters } from "../../model/Match";

const useStyles = makeStyles<Theme>((theme) => ({
  filterPanel: {
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(3),
  },
  filter: {
    width: 300,
  },
}));
/**
 * Get translated text
 */

function useMessages() {
  const intl = useIntl();
  return {
    falsePositiveTitle: intl.formatMessage({
      id: "match.falsePositive.title",
    }),
    falsePositiveTooltip: intl.formatMessage({
      id: "match.falsePositive.tooltip",
    }),
    falsePositive: intl.formatMessage({
      id: "match.falsePositive",
    }),
    truePositive: intl.formatMessage({
      id: "match.truePositive",
    }),
  };
}

function FilterPanel(props: FilterPanelProps): JSX.Element {
  const { filters, onChange, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const handleFalsePositive = useCallback(
    (falsePositive) =>
      onChange(
        lodash.merge({}, filters, {
          falsePositive,
        })
      ),
    [filters, onChange]
  );
  return (
    <div className={clsx(classes.filterPanel, className)} {...other}>
      <BoolFilter
        title={messages.falsePositiveTitle}
        tooltip={messages.falsePositiveTooltip}
        trueText={messages.falsePositive}
        falseText={messages.truePositive}
        onChange={handleFalsePositive}
        value={filters.falsePositive}
        className={classes.filter}
      />
    </div>
  );
}

type FilterPanelProps = {
  filters: MatchQueryFilters;
  onChange: (filters: MatchQueryFilters) => void;
  className?: string;
};
export default FilterPanel;
