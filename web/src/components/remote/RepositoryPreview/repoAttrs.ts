import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";
import { Repository } from "../../../model/VideoFile";
import { formatCount } from "../../../lib/helpers/format";
import { safeTimeDistance } from "../../../lib/messages/safeTimeDistance";

const repoAttrs: AttributeRenderer<Repository>[] = [
  {
    title: "repos.attr.partners",
    value: (repo) => formatCount(repo.stats?.partnersCount || 0),
  },
  {
    title: "repos.attr.fingerprints",
    value: (repo) => formatCount(repo.stats?.totalFingerprintsCount || 0),
  },
  {
    title: "repos.attr.lastSynced",
    value: (repo, intl) => safeTimeDistance(repo.lastSynced, intl),
  },
];

export default repoAttrs;
