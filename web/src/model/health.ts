export type ServiceStatus = {
  available: boolean;
  details?: string | null;
};

export type ServerHealthStatus = {
  semanticSearch: ServiceStatus;
};
