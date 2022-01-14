import { RepositoryType } from "../../model/VideoFile";
import { IntlShape } from "react-intl";

/**
 * Convert repository type into human-readable text.
 */
export default function formatRepoType(
  type: RepositoryType,
  intl: IntlShape
): string {
  switch (type) {
    case RepositoryType.BARE_DATABASE:
      return intl.formatMessage({ id: "repos.type.bareDatabase" });
  }
}
