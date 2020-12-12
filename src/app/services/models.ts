import { SafeUrl } from '@angular/platform-browser';

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
  idCategoryLanguage: string;
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

export interface CountryLanguage {
  idCountryLanguage: string;
  idCountry: string;
  alias: string;
  country: string;
  language: string;
}

export interface CountryTopic {
  idCountryTopic: string;
  idCountry: string;
  identifier: string;
}

export interface CountryTopicLanguage {
  idCountryTopicLanguage: string;
  idCountryTopic: string;
  topic: string;
  description: string;
  language: string;
}

export interface Document {
  idDocument: string;
  idUser: string;
  title: string;
  filename: string;
  mimeType: string;
  size: number;
  widthPixel: number;
  heightPixel: number;
}

export interface Icon {
  idIcon: string;
  name: string;
  image: SafeUrl;
  marker: SafeUrl;
}

export interface Nationality {
  idNationality: string;
  identifier: string;
}

export interface NationalityLanguage {
  idNationalityLanguage: string;
  idNationality: string;
  alias: string;
  nationality: string;
  language: string;
}

export interface Organization {
  idOrganization: string;
  name: string;
}

export interface OrganizationUser {
  idOrganizationUser: string;
  idOrganization: string;
  idUser: string;
  name: string;
  firstName: string;
  lastName: string;
}

export interface Structure {
  idStructure: string;
  idOrganization: string;
  alias: string;
  structurename: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  website: string;
  idIcon: string;
}

export interface StructureLanguage {
  idStructureLanguage: string;
  idStructure: string;
  description: string;
  language: string;
}

export interface StructureCategory {
  idStructureCategory: string;
  idStructure: string;
  idCategory: string;
  identifier: string;
}

export interface StructureImage {
  idStructureImage: string;
  idStructure: string;
  folder: string;
  filename: string;
  mimeType: string;
  size: number;
  sorting: number;
}

export interface RegisteredUser {
  idUser: string;
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface User {
  idUser: string;
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmed: boolean;
  permissions: string[];
  idNationality: string;
  gender: string;
  birthday: string;
}

export interface UserMe {
  name: string;
  permissions: string[];
  idUser: string;
  userType: string;
  idOrganization: string;
  email: string;
}

export interface TokenCredential {
  token: string;
}