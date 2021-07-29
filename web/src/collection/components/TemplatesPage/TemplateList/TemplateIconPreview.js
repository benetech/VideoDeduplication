import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { TemplateIconType } from "../../../../prop-types/TemplateType";
import TemplateIcon from "../TemplateIcon/TemplateIcon";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import Fab from "@material-ui/core/Fab";
import PickIconDialog from "./PickIconDialog";

const useStyles = makeStyles({
  container: {
    transform: "translate(0%, 0px)",
  },
  button: {
    position: "absolute",
    top: -5,
    right: -5,
    display: ({ edit }) => (edit ? "flex" : "none"),
    width: 24,
    height: 24,
    minHeight: 24,
  },
  fabLabel: {
    minHeight: 20,
  },
});

function TemplateIconPreview(props) {
  const { icon, onChange, edit, className, ...other } = props;
  const classes = useStyles({ edit });
  const [editing, setEditing] = useState(false);
  const [staging, setStaging] = useState(icon);

  const toggleEditing = useCallback(() => setEditing(!editing), [editing]);
  const handleDone = useCallback(() => {
    setEditing(false);
    onChange(staging);
  }, [staging, onChange]);

  return (
    <div className={clsx(classes.container, className)} {...other}>
      <TemplateIcon icon={icon} />
      <Fab
        onClick={toggleEditing}
        size="small"
        color="default"
        className={classes.button}
      >
        <EditOutlinedIcon fontSize="small" />
      </Fab>
      <PickIconDialog
        open={editing}
        onClose={toggleEditing}
        onDone={handleDone}
        icon={staging}
        onChange={setStaging}
      />
    </div>
  );
}

TemplateIconPreview.propTypes = {
  /**
   * Icon to be displayed.
   */
  icon: TemplateIconType,
  /**
   * Enable edit mode.
   */
  edit: PropTypes.bool,
  /**
   * Handle icon change.
   */
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default TemplateIconPreview;
