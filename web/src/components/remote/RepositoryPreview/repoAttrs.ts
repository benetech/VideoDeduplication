import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";
import { Repository } from "../../../model/VideoFile";
import { formatCount } from "../../../lib/helpers/format";
import { formatDistance } from "date-fns";

const repoAttrs: AttributeRenderer<Repository>[] = [
  {
    title: "repos.attr.partners",
    value: (repo) => formatCount(repo.stats?.partnersCount || 0),
  },
  {
    title: "repos.attr.fingerprints",
    value: (repo) => formatCount(repo.stats?.fingerprintsCount || 0),
  },
  {
    title: "repos.attr.lastSynced",
    value: (repo, intl) =>
      intl.formatMessage(
        { id: "time.ago" },
        { time: formatDistance(repo.lastSynced, new Date()) }
      ),
  },
];

export default repoAttrs;
