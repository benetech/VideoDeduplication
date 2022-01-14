import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import { RepoTaskFormProps } from "./RepoTaskDescriptor";
import { MatchRemoteFingerprintsRequest } from "../../../model/Task";
import Description from "../../forms/Description";
import { useIntl } from "react-intl";
import InputContainer from "../../forms/InputContainer";
import SingleContributorSelect from "../SingleContributorSelect";
import { Nullable } from "../../../lib/types/util-types";
import { Contributor } from "../../../model/VideoFile";

const useStyles = makeStyles<Theme>((theme) => ({
  description: {
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
    partner: intl.formatMessage({ id: "task.attr.matchPartner" }),
    partnerHelp: intl.formatMessage({ id: "task.attr.matchPartner.help" }),
    all: intl.formatMessage({ id: "all" }),
  };
}

export default function MatchRepoForm(
  props: RepoTaskFormProps<MatchRemoteFingerprintsRequest>
): JSX.Element {
  const { request, onChange, contributors, className } = props;
  const classes = useStyles();
  const messages = useMessages();

  const handlePartnerChange = useCallback(
    (contributor: Nullable<Contributor>) => {
      onChange({ ...request, contributorName: contributor?.name || null });
    },
    [onChange, request]
  );

  const contributor = contributors.find(
    (partner) => partner.name == request.contributorName
  );

  return (
    <div className={className}>
      <Description
        text={messages.description}
        className={classes.description}
      />
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
