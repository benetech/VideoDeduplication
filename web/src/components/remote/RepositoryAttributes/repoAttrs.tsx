import React from "react";
import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";
import { Repository } from "../../../model/VideoFile";
import ValueBadge from "../../basic/ValueBadge";
import formatRepoType from "../../../lib/messages/formatRepoType";
import { safeTimeDistance } from "../../../lib/messages/safeTimeDistance";
import StyledProgressAttr from "../../basic/ProgressAttr/ProgressAttr";

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
    title: "repos.attr.address",
    value: (repo) => repo.address,
  },
  {
    title: "repos.attr.lastSynced",
    value: (repo, intl) => safeTimeDistance(repo.lastSynced, intl),
  },
  {
    title: "repos.attr.partners",
    value: (repo) => `${repo.stats?.partnersCount || 0}`,
  },
  {
    title: "repos.attr.totalFingerprints",
    value: (repo) => `${repo.stats?.totalFingerprintsCount || 0}`,
  },
  {
    title: "repos.attr.pushedFingerprints",
    value: (repo) => `${repo.stats?.pushedFingerprintsCount || 0}`,
  },
  {
    title: "repos.attr.pulledFingerprints",
    value: (repo) => `${repo.stats?.pulledFingerprintsCount || 0}`,
  },
  {
    title: "repos.attr.pullProgress",
    value: (repo) => (
      <StyledProgressAttr
        style={{ fontWeight: "normal" }}
        variant="determinate"
        value={
          (100 * (repo.stats?.pulledFingerprintsCount || 0)) /
            (repo.stats?.totalFingerprintsCount || 1) || 0
        }
      />
    ),
  },
];

export default repoAttrs;
