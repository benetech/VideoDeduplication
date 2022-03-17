import React from "react";
import AttributeTable from "../../basic/AttributeTable";
import { Repository } from "../../../model/VideoFile";
import repoAttrs from "./repoAttrs";

type RepositoryAttributesProps = {
  repository: Repository;
  className?: string;
};

function RepositoryAttributes(props: RepositoryAttributesProps): JSX.Element {
  const { repository, className, ...other } = props;
  return (
    <AttributeTable
      value={repository}
      attributes={repoAttrs}
      className={className}
      {...other}
    />
  );
}

export default RepositoryAttributes;
