import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Picker from "../../../../common/components/GridButtonPicker";
import { useIntl } from "react-intl";
import ButtonBase from "@material-ui/core/ButtonBase";
import useUniqueId from "../../../../common/hooks/useUniqueId";
import FilterContainer from "./FilterContainer";

const useStyles = makeStyles((theme) => ({
  title: {
    ...theme.mixins.title4,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
  more: {
    ...theme.mixins.textSmall,
    fontWeight: "bold",
    color: theme.palette.primary.main,
    marginTop: theme.spacing(2),
    cursor: "pointer",
  },
}));

/**
 * Get i18n text
 */
function useMessages() {
  const intl = useIntl();
  return {
    title: intl.formatMessage({ id: "filter.extensions" }),
    more: intl.formatMessage({ id: "actions.showMoreItems" }),
    less: intl.formatMessage({ id: "actions.showLessItems" }),
  };
}

function FileExtensionPicker(props) {
  const { selected, onChange, extensions: extAttr, className } = props;
  const classes = useStyles();
  const [collapsed, setCollapsed] = useState(true);
  const messages = useMessages();
  const pickerId = useUniqueId("button-picker");

  const more = collapsed && extAttr.length > 6;
  const extensions = more ? extAttr.slice(0, 6) : extAttr;
  const handleMore = useCallback(() => setCollapsed(false), []);
  const handleLess = useCallback(() => setCollapsed(true), []);

  return (
    <FilterContainer title={messages.title} className={clsx(className)}>
      <Picker selected={selected} onChange={onChange} id={pickerId}>
        {extensions.map((extension) => (
          <Picker.Option value={extension} title={extension} key={extension} />
        ))}
      </Picker>
      {more && (
        <ButtonBase
          className={classes.more}
          onClick={handleMore}
          focusRipple
          disableTouchRipple
          aria-controls={pickerId}
        >
          {messages.more}
        </ButtonBase>
      )}
      {!collapsed && (
        <ButtonBase
          className={classes.more}
          onClick={handleLess}
          focusRipple
          disableTouchRipple
          aria-controls={pickerId}
        >
          {messages.less}
        </ButtonBase>
      )}
    </FilterContainer>
  );
}

FileExtensionPicker.propTypes = {
  /**
   * Selected extensions
   */
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  /**
   * Fire when selection changes
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Existing extensions
   */
  extensions: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export default FileExtensionPicker;
