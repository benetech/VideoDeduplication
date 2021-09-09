import React, { useCallback } from "react";
import clsx from "clsx";
import lodash from "lodash";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import BoolFilter from "../FileBrowserPage/FilterPane/BoolFilter";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
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
    falsePositiveTitle: intl.formatMessage({ id: "match.falsePositive.title" }),
    falsePositiveTooltip: intl.formatMessage({
      id: "match.falsePositive.tooltip",
    }),
    falsePositive: intl.formatMessage({ id: "match.falsePositive" }),
    truePositive: intl.formatMessage({ id: "match.truePositive" }),
  };
}

function FilterPanel(props) {
  const { filters, onChange, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();

  const handleFalsePositive = useCallback(
    (falsePositive) => onChange(lodash.merge({}, filters, { falsePositive })),
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

FilterPanel.propTypes = {
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default FilterPanel;
