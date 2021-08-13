import filesInitialState from "../files/root/initialState";
import fileClusterInitialState from "../fileCluster/initialState";
import fileMatchesInitialState from "../fileMatches/initialState";
import tasksRootInitialState from "../tasks/root/initialState";
import taskLogsInitialState from "../taskLogs/initialState";
import templatesRootInitialState from "../templates/root/initialState";
import objectCacheInitialState from "../objects/initialState";
import presetInitialState from "../presets/initialState";
import fileExclusionInitialState from "../file-exclusions/initialState";

/**
 * Application initial state.
 */
const initialState = {
  /**
   * Files initial state.
   */
  files: filesInitialState,
  /**
   * Single file neighboring cluster (closely-connected files).
   */
  fileCluster: fileClusterInitialState,
  /**
   * Single-file's immediate matches (used in 'NN Files Matched' and 'Compare'
   * pages).
   */
  fileMatches: fileMatchesInitialState,
  /**
   * Background tasks.
   */
  tasks: tasksRootInitialState,
  /**
   * Background task logs.
   */
  taskLogs: taskLogsInitialState,
  /**
   * Object templates.
   */
  templates: templatesRootInitialState,
  /**
   * Cache of recognized objects per file.
   */
  objectCache: objectCacheInitialState,
  /**
   * File filter presets.
   */
  presets: presetInitialState,
  /**
   * File exclusions cache.
   */
  fileExclusions: fileExclusionInitialState,
};

export default initialState;
