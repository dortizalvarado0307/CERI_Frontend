export interface CatalogOption {
  id: number;
  name: string;
  lastname?: string;
}

export const getOptionLabel = (option: CatalogOption): string =>
  option.lastname
    ? `${option.name} ${option.lastname}`
    : option.name;