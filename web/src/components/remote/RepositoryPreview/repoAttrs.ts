import { AttributeRenderer } from "../../../lib/types/AttributeRenderer";
import { Repository } from "../../../model/VideoFile";

const repoAttrs: AttributeRenderer<Repository>[] = [
  {
    title: "repos.attr.partners",
    value: () => "5",
  },
  {
    title: "repos.attr.fingerprints",
    value: () => "4.5k",
  },
  {
    title: "repos.attr.lastSynced",
    value: () => "14 days ago",
  },
];

export default repoAttrs;
