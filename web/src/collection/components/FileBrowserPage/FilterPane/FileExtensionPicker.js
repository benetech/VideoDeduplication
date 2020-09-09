import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Picker from "../../../../common/components/GridButtonPicker";
import { useIntl } from "react-intl";
import ButtonBase from "@material-ui/core/ButtonBase";
import useUniqueId from "../../../../common/hooks/useUniqueId";

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

function FileExtensionPicker(props) {
  const { selected, onChange, extensions: extAttr, className } = props;
  const classes = useStyles();
  const [collapsed, setCollapsed] = useState(true);
  const intl = useIntl();
  const pickerId = useUniqueId("button-picker");

  const more = collapsed && extAttr.length > 6;
  const extensions = more ? extAttr.slice(0, 6) : extAttr;
  const handleMore = useCallback(() => setCollapsed(false), []);
  const handleLess = useCallback(() => setCollapsed(true), []);

  return (
    <div className={clsx(className)}>
      <div className={classes.title}>
        {intl.formatMessage({ id: "filter.extensions" })}
      </div>
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
          {intl.formatMessage({ id: "actions.showMoreItems" })}
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
          {intl.formatMessage({ id: "actions.showLessItems" })}
        </ButtonBase>
      )}
    </div>
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
