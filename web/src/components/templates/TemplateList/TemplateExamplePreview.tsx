import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";
import { TemplateExample } from "../../../model/Template";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import Fab from "@material-ui/core/Fab";
import DeleteExampleDialog from "./DeleteExampleDialog";

type TemplateExamplePreviewStyleProps = {
  edit?: boolean;
};

const useStyles = makeStyles<Theme, TemplateExamplePreviewStyleProps>({
  container: {
    width: 80,
    height: 80,
    transform: "translate(0%, 0px)",
    cursor: "pointer",
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
  image: {
    width: 80,
    height: 80,
    objectFit: "cover",
  },
});

function TemplateExamplePreview(
  props: TemplateExamplePreviewProps
): JSX.Element {
  const { example, edit, onClick, onDelete, className, ...other } = props;
  const classes = useStyles({
    edit,
  });
  const [deleting, setDeleting] = useState(false);
  const toggleDeleting = useCallback(() => setDeleting(!deleting), [deleting]);
  const handleClick = useCallback(() => onClick(example), [example]);
  return (
    <div className={clsx(classes.container, className)} {...other}>
      <img
        src={example.url}
        key={example.id}
        alt={`Example ${example.id}`}
        className={classes.image}
        onClick={handleClick}
      />
      <Fab
        onClick={toggleDeleting}
        size="small"
        color="default"
        className={classes.button}
      >
        <CloseOutlinedIcon fontSize="small" />
      </Fab>
      <DeleteExampleDialog
        example={example}
        open={deleting}
        onClose={toggleDeleting}
        onDelete={onDelete}
      />
    </div>
  );
}

type TemplateExamplePreviewProps = {
  /**
   * Template example image that will be displayed.
   */
  example: TemplateExample;

  /**
   * Enable edit mode.
   */
  edit: boolean;

  /**
   * Handle example deletion.
   */
  onDelete: (...args: any[]) => void;

  /**
   * Handle click.
   */
  onClick: (...args: any[]) => void;
  className?: string;
};
export default TemplateExamplePreview;
