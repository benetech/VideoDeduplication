import {
  FileDTO,
  FileQueryResultsDTO,
} from "../../../src/server-api/v1/dto/files";
import { Interception } from "cypress/types/net-stubbing";

/**
 * Get files DTOs from the network request interception.
 */
export default function getRespFiles(interception: Interception): FileDTO[] {
  return (interception.response?.body as FileQueryResultsDTO).items;
}
