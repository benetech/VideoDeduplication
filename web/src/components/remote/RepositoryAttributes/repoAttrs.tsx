import React from "react";
import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";
import { Repository } from "../../../model/VideoFile";
import { formatDistance } from "date-fns";
import ValueBadge from "../../basic/ValueBadge";
import formatRepoType from "../../../lib/messages/formatRepoType";
import { safeTimeDistance } from "../../../lib/messages/safeTimeDistance";

const repoAttrs: AttributeRenderer<Repository>[] = [
  {
    title: "repos.attr.account",
    value: (repo) => repo.login,
  },
  {
    title: "repos.attr.type",
    value: (repo, intl) => (
      <ValueBadge value={formatRepoType(repo.type, intl)} color="secondary" />
    ),
  },
  {
    title: "repos.attr.partners",
    value: (repo) => `${repo.stats?.partnersCount || 0}`,
  },
  {
    title: "repos.attr.fingerprints",
    value: (repo) => `${repo.stats?.fingerprintsCount || 0}`,
  },
  {
    title: "repos.attr.lastSynced",
    value: (repo, intl) => safeTimeDistance(repo.lastSynced, intl),
  },
];

export default repoAttrs;
