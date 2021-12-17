import React, { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import FlatPane from "../../components/basic/FlatPane/FlatPane";
import Title from "../../components/basic/Title";
import PaneHeader from "../../components/basic/PaneHeader/PaneHeader";
import { useIntl } from "react-intl";
import { useShowRepositoriesPage } from "../../routing/hooks";
import BareDatabaseRepoForm, {
  BareDatabaseRepoFields,
  DefaultBareDatabaseRepoFields,
  useValidateDBRepoFields,
} from "../../components/remote/BareDatabaseRepoForm";
import { Errors } from "../../lib/forms/handler-types";
import Button from "../../components/basic/Button";
import { hasErrors } from "../../lib/forms/validation";
import { useCreateRepository } from "../../application/api/repositories/useRepositoryAPI";
import { Transient } from "../../lib/entity/Entity";
import { Repository, RepositoryType } from "../../model/VideoFile";
import { ValidationError } from "../../server-api/ServerError";
import nameErrorMessage from "../../lib/messages/nameErrorMessage";

const useStyles = makeStyles<Theme>((theme) => ({
  repoConstructorPane: {},
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(4),
  },
  action: {
    marginLeft: theme.spacing(1),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    intl,
    createRepo: intl.formatMessage({ id: "repos.action.create" }),
    create: intl.formatMessage({ id: "actions.create" }),
    discard: intl.formatMessage({ id: "actions.discard" }),
    passVisibility: intl.formatMessage({ id: "actions.changePassVisibility" }),
  };
}

/**
 * Create fresh transient repository from repo-form fields.
 */
function makeRepo(fields: BareDatabaseRepoFields): Transient<Repository> {
  const login = encodeURIComponent(fields.login);
  const password = encodeURIComponent(fields.password);
  const host = encodeURIComponent(fields.host);
  const databaseName = encodeURIComponent(fields.databaseName);
  return {
    name: fields.name,
    type: RepositoryType.BARE_DATABASE,
    login: fields.login,
    address: `postgresql://${login}:${password}@${host}:${fields.port}/${databaseName}`,
  };
}

/**
 * Define hook to create repository.
 */
function useCreateRepoHandler(
  fields: BareDatabaseRepoFields,
  errors: Errors<BareDatabaseRepoFields>,
  setErrors: (errors: Errors<BareDatabaseRepoFields>) => void,
  onSuccess: (repo: Repository) => void
): () => Promise<void> {
  const intl = useIntl();
  const validateFields = useValidateDBRepoFields();
  const createRepo = useCreateRepository();

  return useCallback(async () => {
    if (hasErrors(errors)) {
      return;
    }
    const lazyErrors = validateFields(fields);
    if (hasErrors(lazyErrors)) {
      setErrors(lazyErrors);
      return;
    }
    // Do create repo
    try {
      const repo = await createRepo(makeRepo(fields));
      onSuccess(repo);
    } catch (error) {
      if (error instanceof ValidationError && error.fields.name != null) {
        const updatedErrors = {
          name: nameErrorMessage(intl, error.fields.name),
        };
        setErrors(updatedErrors);
      }
    }
  }, [fields, errors]);
}

type RepoConstructorPaneProps = {
  className?: string;
};

function RepoConstructorPane(props: RepoConstructorPaneProps): JSX.Element {
  const { className, ...other } = props;
  const classes = useStyles();
  const messages = useMessages();
  const showRepositories = useShowRepositoriesPage();

  const [errors, setErrors] = useState<Errors<BareDatabaseRepoFields>>({});
  const [fields, setFields] = useState<BareDatabaseRepoFields>(
    DefaultBareDatabaseRepoFields
  );

  const handleCreate = useCreateRepoHandler(
    fields,
    errors,
    setErrors,
    showRepositories
  );

  return (
    <FlatPane className={className} {...other}>
      <PaneHeader>
        <Title text={messages.createRepo} variant="subtitle" />
      </PaneHeader>
      <BareDatabaseRepoForm
        fields={fields}
        onFieldsChange={setFields}
        errors={errors}
        onErrorsChange={setErrors}
      />
      <div className={classes.actions}>
        <Button
          className={classes.action}
          onClick={showRepositories}
          color="secondary"
          variant="contained"
        >
          {messages.discard}
        </Button>
        <Button
          className={classes.action}
          onClick={handleCreate}
          color="primary"
          variant="contained"
        >
          {messages.create}
        </Button>
      </div>
    </FlatPane>
  );
}

export default RepoConstructorPane;
