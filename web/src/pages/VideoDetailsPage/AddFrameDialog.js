import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { useIntl } from "react-intl";
import thumbnailURL from "../../application/state/files/helpers/thumbnailURL";
import FileType from "../../prop-types/FileType";
import useLoadAllTemplates from "../../application/api/templates/useLoadAllTemplates";
import TemplateSelect from "../../components/templates/TemplateSelect";
import Button from "../../components/basic/Button";
import { useCreateExampleFromFrame } from "../../application/api/templates/useTemplateAPI";
import indexEntities from "../../application/common/helpers/indexEntities";

const useStyles = makeStyles((theme) => ({
  noScroll: {
    overflowY: "hidden",
  },
  content: {
    display: "flex",
    flexDirection: "column",
  },
  form: {
    width: 500,
  },
  image: {
    width: 500,
    marginBottom: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    addFrame: intl.formatMessage({ id: "actions.addFrameToTemplate" }),
    create: intl.formatMessage({ id: "actions.create" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
  };
}

/**
 * Use video frame as a new template example.
 */
function AddFrameDialog(props) {
  const { file, time, onClose, className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const [selected, setSelected] = useState([]);
  const { templates } = useLoadAllTemplates();
  const templateIndex = useMemo(() => indexEntities(templates), [templates]);
  const addFrame = useCreateExampleFromFrame(true);

  const handleCreate = useCallback(() => {
    for (const id of selected) {
      const template = templateIndex.get(id);
      addFrame(template, file, time).catch(console.error);
    }
    onClose();
  }, [templateIndex, selected, file, time]);

  return (
    <Dialog className={clsx(className)} onClose={onClose} {...other}>
      <DialogTitle>{messages.addFrame}</DialogTitle>
      <DialogContent>
        <div className={classes.content}>
          <img
            src={thumbnailURL(file, time)}
            alt={`${file?.filename} at ${time}`}
            className={classes.image}
          />
          <TemplateSelect
            templates={templates}
            onChange={setSelected}
            value={selected}
            className={classes.form}
            fullWidth
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCreate}
          color="primary"
          autoFocus
          disabled={selected.length === 0}
        >
          {messages.create}
        </Button>
        <Button onClick={onClose} color="secondary">
          {messages.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddFrameDialog.propTypes = {
  /**
   * File to extract frame.
   */
  file: FileType.isRequired,
  /**
   * Time position in file, in milliseconds
   */
  time: PropTypes.number.isRequired,
  /**
   * Handle dialog close.
   */
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default AddFrameDialog;
