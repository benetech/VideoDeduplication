import React, { useCallback, useState } from "react";
import { useDeleteRepository } from "../../application/api/repositories/useRepositoryAPI";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import useUniqueId from "../../lib/hooks/useUniqueId";
import { useIntl } from "react-intl";
import Button from "../../components/basic/Button";
import { Repository } from "../../model/VideoFile";
import { Nullable } from "../../lib/types/util-types";

type DeleteRepoDialogOptions = {
  onSuccess?: () => void;
};

type DeleteRepoDialogResults = {
  dialog: React.ReactNode;
  handleOpen: (repo: Nullable<Repository>) => void;
  handleClose: () => void;
};

export default function useDeleteRepoDialog(
  options: DeleteRepoDialogOptions = {}
): DeleteRepoDialogResults {
  const deleteRepo = useDeleteRepository();
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [repo, setRepo] = useState<Nullable<Repository>>(null);
  const handleOpen = useCallback((repo: Nullable<Repository>) => {
    setRepo(repo);
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => setOpen(false), []);
  const titleId = useUniqueId("dialog-title");
  const descriptionId = useUniqueId("dialog-text");

  const handleDelete = useCallback(async () => {
    if (repo == null) {
      return;
    }
    try {
      await deleteRepo(repo);
      handleClose();
      if (options.onSuccess != null) {
        options.onSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  }, [repo]);

  const dialog: React.ReactNode = (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <DialogTitle id={titleId}>
        {intl.formatMessage({ id: "repos.action.delete" })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id={descriptionId}>
          {intl.formatMessage(
            { id: "repos.action.delete.question" },
            { name: repo?.name || "" }
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="outlined">
          {intl.formatMessage({ id: "actions.cancel" })}
        </Button>
        <Button
          onClick={handleDelete}
          color="primary"
          variant="outlined"
          autoFocus
        >
          {intl.formatMessage({ id: "actions.delete" })}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return {
    dialog,
    handleOpen,
    handleClose,
  };
}
