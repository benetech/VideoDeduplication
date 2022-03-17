import React, { useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import { TaskBuilderProps } from "../model";
import { MatchRemoteFingerprintsRequest } from "../../../../model/Task";
import { useIntl } from "react-intl";
import Description from "../../../forms/Description";
import useUniqueId from "../../../../lib/hooks/useUniqueId";
import useRepositoriesAll from "../../../../application/api/repositories/useRepositoriesAll";
import FormControl from "@material-ui/core/FormControl";
import InputContainer from "../../../forms/InputContainer";
import useContributorsAll from "../../../../application/api/repositories/useContributorsAll";
import SingleContributorSelect from "../../../remote/SingleContributorSelect";
import { Nullable } from "../../../../lib/types/util-types";
import { Contributor } from "../../../../model/VideoFile";

const useStyles = makeStyles<Theme>((theme) => ({
  description: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
}));

/**
 * Get translated text.
 */
function useMessages() {
  const intl = useIntl();
  return {
    description: intl.formatMessage({
      id: "task.type.matchRemote.description",
    }),
    repo: intl.formatMessage({ id: "task.attr.matchRepository" }),
    repoHelp: intl.formatMessage({ id: "task.attr.matchRepository.help" }),
    partner: intl.formatMessage({ id: "task.attr.matchPartner" }),
    partnerHelp: intl.formatMessage({ id: "task.attr.matchPartner.help" }),
    all: intl.formatMessage({ id: "all" }),
  };
}

function MatchRemoteFingerprints(
  props: TaskBuilderProps<MatchRemoteFingerprintsRequest>
): JSX.Element {
  const { request, onChange, onValidated, className } = props;
  const classes = useStyles();
  const messages = useMessages();
  const repoLabelId = useUniqueId("label-repo-");
  const { repositories } = useRepositoriesAll();
  const { contributors } = useContributorsAll({
    repositoryId: request.repositoryId || 0,
  });

  useEffect(
    () =>
      onValidated(!request.contributorName || (request.repositoryId || 0) > 0),
    [request.repositoryId]
  );

  const renderRepo = useCallback(
    (selectedId) =>
      repositories.find((repo) => repo.id === selectedId)?.name || messages.all,
    [repositories]
  );

  const handleRepoChange = useCallback(
    (event) => {
      onChange({
        ...request,
        repositoryId: event.target.value,
        contributorName: null,
      });
    },
    [onChange, request]
  );

  const handlePartnerChange = useCallback(
    (contributor: Nullable<Contributor>) => {
      onChange({ ...request, contributorName: contributor?.name || null });
    },
    [onChange, request]
  );

  const contributor = contributors.find(
    (contributor) => contributor.name === request.contributorName
  );

  return (
    <div className={className}>
      <Description
        className={classes.description}
        text={messages.description}
      />
      <InputContainer title={messages.repo} tooltip={messages.repoHelp}>
        <FormControl fullWidth variant="outlined">
          <InputLabel id={repoLabelId}>{messages.repo}</InputLabel>
          <Select
            labelId={repoLabelId}
            value={request.repositoryId || 0}
            onChange={handleRepoChange}
            renderValue={renderRepo}
            disabled={repositories.length === 0}
            labelWidth={130}
          >
            <MenuItem value={0}>
              <ListItemText primary={messages.all} />
            </MenuItem>
            {repositories.map((repository) => (
              <MenuItem key={repository.id} value={repository.id}>
                <ListItemText primary={repository.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </InputContainer>
      <InputContainer title={messages.partner} tooltip={messages.partnerHelp}>
        <SingleContributorSelect
          contributors={contributors}
          selected={contributor}
          onSelect={handlePartnerChange}
          disabled={request.repositoryId == null || request.repositoryId <= 0}
        />
      </InputContainer>
    </div>
  );
}

export default MatchRemoteFingerprints;
