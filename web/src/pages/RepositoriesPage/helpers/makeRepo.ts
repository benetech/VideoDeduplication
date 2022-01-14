import { BareDatabaseRepoFields } from "../../../components/remote/BareDatabaseRepoForm";
import { RepositoryPrototype, RepositoryType } from "../../../model/VideoFile";

/**
 * Create fresh transient repository from repo-form fields.
 */
export default function makeRepo(
  fields: BareDatabaseRepoFields
): RepositoryPrototype {
  const login = encodeURIComponent(fields.login);
  const password = encodeURIComponent(fields.password);
  const host = encodeURIComponent(fields.host);
  const databaseName = encodeURIComponent(fields.databaseName);
  return {
    name: fields.name,
    type: RepositoryType.BARE_DATABASE,
    login: fields.login,
    address: `postgresql://${host}:${fields.port}/${databaseName}`,
    credentials: `postgresql://${login}:${password}@${host}:${fields.port}/${databaseName}`,
  };
}
