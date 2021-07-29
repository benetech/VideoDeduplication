import React, { useCallback, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { TemplateExampleType } from "../../../../prop-types/TemplateType";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import Fab from "@material-ui/core/Fab";
import DeleteExampleDialog from "./DeleteExampleDialog";

const useStyles = makeStyles({
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

function TemplateExamplePreview(props) {
  const { example, edit, onClick, onDelete, className, ...other } = props;
  const classes = useStyles({ edit });
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

TemplateExamplePreview.propTypes = {
  /**
   * Template example image that will be displayed.
   */
  example: TemplateExampleType.isRequired,
  /**
   * Enable edit mode.
   */
  edit: PropTypes.bool.isRequired,
  /**
   * Handle example deletion.
   */
  onDelete: PropTypes.func.isRequired,
  /**
   * Handle click.
   */
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default TemplateExamplePreview;
