export interface Language {
  name: string;
  value: string;
}

export interface MessageException {
  name: string;
  status: number;
  statusText: string;
  message: string;
}

export interface MessageError {
  title: string;
  description: string;
}

export interface QuickSearch {
  search: string;
}

export interface Category {
  idCategory: string;
  identifier: string;
  type: string;
}

export interface CategoryLanguage {
  idCategory: string;
  alias: string;
  category: string;
  language: string;
}

export interface Country {
  idCountry: string;
  identifier: string;
  completed: boolean;
}