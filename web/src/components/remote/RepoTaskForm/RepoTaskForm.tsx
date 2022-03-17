import React from "react";
import { RepoTaskFormProps } from "./RepoTaskDescriptor";
import { TaskRequestType } from "../../../model/Task";
import PullRepoForm from "./PullRepoForm";
import PushRepoForm from "./PushRepoForm";
import MatchRepoForm from "./MatchRepoForm";

function RepoTaskForm(props: RepoTaskFormProps): JSX.Element {
  const { request, ...otherProps } = props;
  switch (request.type) {
    case TaskRequestType.PULL_FINGERPRINTS:
      return <PullRepoForm request={request} {...otherProps} />;
    case TaskRequestType.PUSH_FINGERPRINTS:
      return <PushRepoForm request={request} {...otherProps} />;
    case TaskRequestType.MATCH_REMOTE_FINGERPRINTS:
      return <MatchRepoForm request={request} {...otherProps} />;
  }
}

export default RepoTaskForm;
