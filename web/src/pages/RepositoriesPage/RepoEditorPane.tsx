import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme, Tooltip } from "@material-ui/core";
import {
  useShowRepositoriesPage,
  useShowRepository,
} from "../../routing/hooks";
import { Errors } from "../../lib/forms/handler-types";
import {
  RepoEditorFields,
  useValidateRepoEditor,
} from "../../components/remote/RepoEditorForm/RepoEditorFields";
import { useParams } from "react-router";
import { EntityPageURLParams } from "../../routing/routes";
import useRepository from "../../application/api/repositories/useRepository";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import LoadingStatus from "../../components/basic/LoadingStatus";
import Spacer from "../../components/basic/Spacer";
import { useIntl } from "react-intl";
import Title from "../../components/basic/Title";
import Button from "../../components/basic/Button";
import RepoEditorForm from "../../components/remote/RepoEditorForm/RepoEditorForm";
import { useUpdateRepository } from "../../application/api/repositories/useRepositoryAPI";
import { hasErrors } from "../../lib/forms/validation";
import { ValidationError } from "../../server-api/ServerError";
import nameErrorMessage from "../../lib/messages/nameErrorMessage";
import { Repository } from "../../model/VideoFile";
import { Nullable } from "../../lib/types/util-types";

const useStyles = makeStyles<Theme>((theme) => ({
  repoEditorPane: {},
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(4),
  },
  action: {
    marginLeft: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(2),
  },
  loadingHeader: {
    marginBottom: 0,
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    edit: intl.formatMessage({ id: "repos.action.edit" }),
    back: intl.formatMessage({ id: "actions.goBack" }),
    cancel: intl.formatMessage({ id: "actions.cancel" }),
    update: intl.formatMessage({ id: "actions.update" }),
  };
}

/**
 * Define hook to update repository.
 */
function useCreateRepoHandler(
  repository: Nullable<Repository>,
  fields: RepoEditorFields,
  errors: Errors<RepoEditorFields>,
  setErrors: (errors: Errors<RepoEditorFields>) => void,
  onSuccess: (repo: Repository) => void
): () => Promise<void> {
  const intl = useIntl();
  const updateRepo = useUpdateRepository();
  const validateForm = useValidateRepoEditor();

  return useCallback(async () => {
    if (repository == null) {
      return;
    }
    if (hasErrors(errors)) {
      return;
    }
    const lazyErrors = validateForm(fields);
    if (hasErrors(lazyErrors)) {
      setErrors(lazyErrors);
      return;
    }

    // Do update repo
    try {
      const repo = await updateRepo({ id: repository.id, ...fields });
      onSuccess(repo);
    } catch (error) {
      if (error instanceof ValidationError && error.fields.name != null) {
        const updatedErrors = {
          name: nameErrorMessage(intl, error.fields.name),
        };
        setErrors(updatedErrors);
      }
    }
  }, [repository, errors, fields, onSuccess]);
}

type RepoEditorPaneProps = {
  className?: string;
};

function RepoEditorPane(props: RepoEditorPaneProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const { id } = useParams<EntityPageURLParams>();
  const { repository, error: loadError, load } = useRepository(Number(id));
  const showRepositories = useShowRepositoriesPage();
  const showRepo = useShowRepository();
  const handleShowRepo = useCallback(() => showRepo(id), [id]);

  const [errors, setErrors] = useState<Errors<RepoEditorFields>>({});
  const [fields, setFields] = useState<RepoEditorFields>({ name: "" });

  // Initialize editor-form when repository is loaded
  useEffect(() => {
    if (repository != null) {
      setFields({ name: repository.name });
    }
  }, [repository?.id]);

  const handleUpdate = useCreateRepoHandler(
    repository,
    fields,
    errors,
    setErrors,
    handleShowRepo
  );

  if (repository == null) {
    return (
      <FlatPane className={className} {...other}>
        <PaneHeader className={classes.loadingHeader}>
          <Tooltip title={messages.back}>
            <IconButton onClick={showRepositories} size="small">
              <ArrowBackOutlinedIcon />
            </IconButton>
          </Tooltip>
          <LoadingStatus
            error={loadError}
            onRetry={load}
            variant="subtitle"
            className={classes.title}
          />
          <Spacer />
        </PaneHeader>
      </FlatPane>
    );
  }

  return (
    <FlatPane className={className} {...other}>
      <PaneHeader>
        <Title text={messages.edit} variant="subtitle" />
      </PaneHeader>
      <RepoEditorForm
        fields={fields}
        onFieldsChange={setFields}
        errors={errors}
        onErrorsChange={setErrors}
      />
      <div className={classes.actions}>
        <Button
          className={classes.action}
          onClick={handleShowRepo}
          color="secondary"
          variant="contained"
        >
          {messages.cancel}
        </Button>
        <Button
          className={classes.action}
          onClick={handleUpdate}
          color="primary"
          variant="contained"
        >
          {messages.update}
        </Button>
      </div>
    </FlatPane>
  );
}

export default RepoEditorPane;
