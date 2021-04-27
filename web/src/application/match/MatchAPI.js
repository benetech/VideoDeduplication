import { useServer } from "../../server-api/context";
import { useDispatch } from "react-redux";
import { useMemo } from "react";

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

  constructor(server, dispatch) {
    this.server = server;
    this.dispatch = dispatch;
  }

  async update(updated, original) {
    if (updated.id !== original?.id) {
      throw new Error(
        `Original match has different id: ${updated.id} != ${original?.id}`
      );
    }
    try {
      this.dispatch(updateMatch(updated));
      await this.server.updateMatch(updated);
    } catch (error) {
      this.dispatch(updateMatch(original));
      throw error;
    }
  }
}
