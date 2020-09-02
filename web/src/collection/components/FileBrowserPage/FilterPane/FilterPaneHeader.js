import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import TuneIcon from "@material-ui/icons/Tune";
import IconButton from "@material-ui/core/IconButton";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import SquaredIconButton from "../../../../common/components/SquaredIconButton";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    borderBottom: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#D8D8D8",
    padding: theme.spacing(2),
  },
  toggleButton: {},
  title: {
    ...theme.mixins.title3,
    flexGrow: 1,
    marginLeft: theme.spacing(2),
  },
}));

function FilterPaneHeader(props) {
  const { onClose, onSave, className } = props;
  const classes = useStyles();
  const intl = useIntl();

  return (
    <div className={clsx(classes.header, className)}>
      <SquaredIconButton
        onClick={onClose}
        variant="outlined"
        color="secondary"
        className={classes.toggleButton}
      >
        <TuneIcon />
      </SquaredIconButton>

      <div className={classes.title}>
        {intl.formatMessage({ id: "filter.title" })}
      </div>
      <IconButton onClick={onSave} size="small">
        <SaveOutlinedIcon />
      </IconButton>
      <IconButton onClick={onClose} size="small">
        <CloseOutlinedIcon />
      </IconButton>
    </div>
  );
}

FilterPaneHeader.propTypes = {
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  className: PropTypes.string,
};

export default FilterPaneHeader;
