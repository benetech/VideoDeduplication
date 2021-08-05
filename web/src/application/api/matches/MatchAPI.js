import { useServer } from "../../../server-api/context";
import { useDispatch } from "react-redux";
import { useMemo } from "react";
import {
  deleteFileMatch,
  restoreFileMatch,
  updateMatch,
} from "../../state/fileMatches/actions";

/**
 * This API implements integration between bare Server API
 * and the Application state (managed by Redux.js).
 */
export default class MatchAPI {
  /**
   * React hook to obtain MatchAPI
   */
  static use() {
    const server = useServer();
    const dispatch = useDispatch();
    return useMemo(() => new MatchAPI(server, dispatch), [server, dispatch]);
  }

  /**
   * @param {Server} server
   * @param {function} dispatch
   */
  constructor(server, dispatch) {
    this.server = server;
    this.dispatch = dispatch;
  }

  async updateFileMatch(updated, original) {
    if (updated.id !== original?.id) {
      throw new Error(
        `Original match has different id: ${updated.id} != ${original?.id}`
      );
    }
    try {
      this.dispatch(updateMatch(updated));
      await this.server.matches.update(updated);
    } catch (error) {
      this.dispatch(updateMatch(original));
      throw error;
    }
  }

  async deleteMatch(match) {
    try {
      this.dispatch(deleteFileMatch(match));
      await this.server.matches.update({ ...match, falsePositive: true });
    } catch (error) {
      this.dispatch(restoreFileMatch(match));
      throw error;
    }
  }

  async restoreMatch(match) {
    try {
      this.dispatch(restoreFileMatch(match));
      await this.server.matches.update({ ...match, falsePositive: false });
    } catch (error) {
      this.dispatch(deleteFileMatch(match));
      throw error;
    }
  }
}
