export type ServiceStatusDTO = {
  available: boolean;
  details?: string | null;
};

/**
 * Response of the `/health` endpoint.
 *
 * The /health endpoint checks for the optional services' status.
 */
export type HealthDTO = {
  semantic_search: ServiceStatusDTO;
};
