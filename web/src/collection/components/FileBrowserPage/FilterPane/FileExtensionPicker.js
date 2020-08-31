import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import Picker from "../../../../common/components/GridButtonPicker";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  title: {
    ...theme.mixins.title4,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
}));

function FileExtensionPicker(props) {
  const { selected, onChange, extensions, className } = props;
  const intl = useIntl();
  const classes = useStyles();
  return (
    <div className={clsx(className)}>
      <div className={classes.title}>
        {intl.formatMessage({ id: "filter.extensions" })}
      </div>
      <Picker selected={selected} onChange={onChange}>
        {extensions.map((extension) => (
          <Picker.Option value={extension} title={extension} />
        ))}
      </Picker>
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
