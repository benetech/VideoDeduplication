import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import { useServer } from "../../../../server-api/context";
import {
  addPreset,
  addPresets,
  deletePreset,
  updatePreset,
} from "../../../state/presets/actions";
import { selectPresets } from "../../../state/selectors";
import initialState from "../../../state/fileList/initialState";

/**
 * This API implements integration between bare Server API
 * and the Application state (managed by Redux.js).
 */
export default class PresetAPI {
  /**
   * Default file filters.
   */
  static DefaultFilters = initialState.filters;

  /**
   * React hook to obtain PresetAPI
   */
  static use() {
    const server = useServer();
    const dispatch = useDispatch();
    return useMemo(() => new PresetAPI(server, dispatch), [server, dispatch]);
  }

  constructor(server, dispatch) {
    this.server = server;
    this.dispatch = dispatch;
  }

  async deletePreset(preset) {
    this.dispatch(deletePreset(preset));
    try {
      await this.server.deletePreset(preset);
    } catch (error) {
      this.dispatch(addPreset(preset));
      throw error;
    }
  }

  async addPreset(preset) {
    const created = await this.server.createPreset(preset);
    this.dispatch(addPreset(created));
  }

  async updatePreset(updated, original) {
    if (updated.id !== original?.id) {
      throw new Error(
        `Original preset has different id: ${updated.id} != ${original?.id}`
      );
    }
    try {
      this.dispatch(updatePreset(updated));
      await this.server.updatePreset(updated);
    } catch (error) {
      this.dispatch(updatePreset(original));
    }
  }

  usePresets() {
    return useSelector(selectPresets).presets;
  }

  useLazyPresetList() {
    const { presets, total } = useSelector(selectPresets);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const hasMore = total === undefined || presets.length < total;

    const loadMore = useCallback(
      async (limit = 100) => {
        if (loading || !hasMore) {
          return;
        }
        setLoading(true);
        setError(false);
        try {
          const fetched = await this.server.fetchPresets({
            limit,
            offset: presets.length,
          });
          this.dispatch(addPresets(fetched.presets, fetched.total));
        } catch (error) {
          setError(true);
        } finally {
          setLoading(false);
        }
      },
      [presets, loading, hasMore]
    );

    return {
      presets,
      loadMore,
      hasMore,
      isLoading: loading,
      error,
    };
  }
}
