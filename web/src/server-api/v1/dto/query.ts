export type QueryParams = {
  [name: string]: string | number | boolean;
};

export type QueryResultsDTO<T> = {
  total: number;
  offset: number;
  items: T[];
};
