import React, { useCallback } from "react";
import clsx from "clsx";
import lodash from "lodash";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import BoolFilter from "../FileBrowserPage/FilterPane/BoolFilter";
import { useDispatch, useSelector } from "react-redux";
import { selectFileMatches } from "../../application/state/root/selectors";
import { updateFileMatchesParams } from "../../application/state/fileMatches/actions";
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
  const { className, ...other } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const messages = useMessages();
  const params = useSelector(selectFileMatches).params;

  const handleFalsePositive = useCallback(
    (falsePositive) => {
      const updatedParams = lodash.merge({}, params, {
        filters: { falsePositive },
      });
      dispatch(updateFileMatchesParams(updatedParams));
    },
    [params]
  );

  return (
    <div className={clsx(classes.filterPanel, className)} {...other}>
      <BoolFilter
        title={messages.falsePositiveTitle}
        tooltip={messages.falsePositiveTooltip}
        trueText={messages.falsePositive}
        falseText={messages.truePositive}
        onChange={handleFalsePositive}
        value={params.filters.falsePositive}
        className={classes.filter}
      />
    </div>
  );
}

FilterPanel.propTypes = {
  className: PropTypes.string,
};

export default FilterPanel;
