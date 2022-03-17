import {
  BareDatabaseRepoFields,
  useValidateDBRepoFields,
} from "../../../components/remote/BareDatabaseRepoForm";
import useOnline from "../../../application/api/useOnline";
import { useEffect, useState } from "react";
import makeRepo from "./makeRepo";
import { hasErrors } from "../../../lib/forms/validation";
import { useCheckRepoCredentials } from "../../../application/api/repositories/useRepositoryAPI";

export enum CheckStatus {
  CONFIRMED,
  UNCONFIRMED,
  LOADING,
  UNKNOWN,
}

export default function useCheckCredentials(
  fields: BareDatabaseRepoFields
): CheckStatus {
  const online = useOnline();
  const checkCredentials = useCheckRepoCredentials();
  const validateFields = useValidateDBRepoFields();
  const [results, setResults] = useState<CheckStatus>(CheckStatus.UNKNOWN);

  useEffect(() => {
    // Immediately make status unknown on any fields change
    setResults(CheckStatus.UNKNOWN);

    // Do nothing if online-workflow is explicitly disabled or fields have errors.
    if (!online || hasErrors(validateFields(fields))) {
      return;
    }

    // Schedule a new credentials check after a delay
    const handle = setTimeout(async () => {
      setResults(CheckStatus.LOADING);
      try {
        const repo = makeRepo(fields);
        const confirmed = await checkCredentials(repo);
        setResults(confirmed ? CheckStatus.CONFIRMED : CheckStatus.UNCONFIRMED);
      } catch {
        setResults(CheckStatus.UNKNOWN);
      }
    }, 1000);
    return () => clearTimeout(handle);
  }, [fields]);

  return results;
}
