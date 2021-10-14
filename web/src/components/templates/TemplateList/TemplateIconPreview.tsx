import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { TemplateIcon } from "../../../model/Template";
import TemplateIconViewer from "../TemplateIcon/TemplateIconViewer";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import Fab from "@material-ui/core/Fab";
import PickIconDialog from "./PickIconDialog";

type TemplateIconPreviewStyleProps = {
  edit?: boolean;
};

const useStyles = makeStyles<Theme, TemplateIconPreviewStyleProps>({
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

function TemplateIconPreview(props: TemplateIconPreviewProps): JSX.Element {
  const { icon, onChange, edit, className, ...other } = props;
  const classes = useStyles({
    edit,
  });
  const [editing, setEditing] = useState(false);
  const [staging, setStaging] = useState(icon);
  const toggleEditing = useCallback(() => setEditing(!editing), [editing]);
  const handleDone = useCallback(() => {
    setEditing(false);
    onChange(staging);
  }, [staging, onChange]);
  return (
    <div className={clsx(classes.container, className)} {...other}>
      <TemplateIconViewer icon={icon} />
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

type TemplateIconPreviewProps = {
  /**
   * Icon to be displayed.
   */
  icon: TemplateIcon;

  /**
   * Enable edit mode.
   */
  edit?: boolean;

  /**
   * Handle icon change.
   */
  onChange: (...args: any[]) => void;
  className?: string;
};
export default TemplateIconPreview;
