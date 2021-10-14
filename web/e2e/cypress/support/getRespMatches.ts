import { Interception } from "cypress/types/net-stubbing";
import {
  FileMatchDTO,
  FileMatchesQueryResultsDTO,
} from "../../../src/server-api/v1/dto/matches";

/**
 * Get file matches from file/matches query interception.
 */
export default function getRespMatches(
  interception: Interception
): FileMatchDTO[] {
  return (interception.response?.body as FileMatchesQueryResultsDTO).items;
}
