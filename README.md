<!-- PROJECT LOGO -->
<br />
<p>
  <h3>Global Passport Project Frontend</h3>
  <img src="logo.png" />
</p>

<!-- GETTING STARTED -->
## Table of contents

* [Global Passport Project](#global-passport-project)
* [Build with](#built-with)
* [Software Used](#software-used)
* [Side technologies](#side-technologies)
* [Directory structure](#directory-structure)
* [Starting a development environment](#starting-a-development-environment)
* [Available scripts](#available-scripts)
* [How the backend works](#how-the-backend-works)

## Global Passport Project

Global Passport Project is a breakthrough initiative that leverages on decentralized technology to support mixed migrants along their journey, protect
their privacy while reporting human rights violations, and engage them as citizens integrating in their new communities. GPP will also enormously
improve the capacity of NGOs and social enterprises to reach out to migrants and design their actions, thus streamlining their resources and improving
their performance and records when applying for funds and calls.

GPP is a blockchain-based platform with a website and mobile App through which mixed migrants can safely store important documents, access info on
the countries crossed and the solidarity network in the area they are in, as well as report on abuses they might face along the journey. All data is personal
and inviolable, and it will be kept on Blockchain with a double-level encryption component.

* GPP’s key tool is the first ever DocWallet, a unique and innovative "safe space" where migrants can scan and upload their ID, educational or medical
records that might get lost during their journey or might not be convenient to keep them physically with them. The lack of documentation is often a
key issue in the migratory process.

* GPP App will provide the user with a detailed and comprehensive mapping of solidarity structures in transit/destination countries: upon voluntary
geolocalization, an interactive map will provide information on the structures (i.e. associations, collectives, unions, NGOs, lawyers, humanitarian
protection) and also up-to-date information on the legislation in force in every country and territory crossed.

* GPP is also a multimedia tool for mixed migrant to report and document abuses faced along the journey after being provided with a brief tutorial on
citizen journalism.

The platform is designed WITH migrants rather than FOR migrants: they are the main and ultimate beneficiaries of this project, whose aim is to enable
them to embark in safer journeys and experience an easier settling, but also to engage them as active subjects of participatory democracy practices and a
narrative process that will start from their first hand experiences as narrating subjects rather than narrated ones.

It is meant to serve as an innovative tool also for the third sector (NGOs, aid agencies) to access information and first-hand data that go beyond
government control and a useful tool to improve and strengthen their interventions. GPP may also contribute to an in-depth reconsideration of the
operational modalities which are very often blamed for adopting a top-down approach. The possibility to receive detailed information and to be able to
directly get in contact with their targets and potential beneficiaries will allow to improve the effectiveness and efficiency of their actions, and ensure a
streamlined use of the resources.

## Built with

* [Angular 10](https://angular.io/)
* [Typescript](https://www.typescriptlang.org)
* [CoreUI](https://coreui.io)

## Software used

* [npm](https://www.npmjs.com)
* [Visual Studio Code](https://code.visualstudio.com)
* [Postman](https://www.postman.com)
* [GitHub](https://github.com)

## Side technologies

### Production dependencies

* agm/core: contains solutions for the Google Maps JavaScript Core API.
* angular/animations: Angular animations integration with web-animations.
* angular/common: Angular commonly needed directives and services.
* angular/compiler: Angular compiler library.
* angular/core: Angular core framework.
* angular/forms: Angular directives and services for creating forms.
* angular/google-maps: Angular Google Maps.
* angular/localize: Angular library for localizing messages.
* angular/platform-browser: library for using Angular in a web browser.
* angular/platform-browser-dynamic: library for using Angular in a web browser with JIT compilation.
* angular/router: Angular routing library.
* auth0/angular-jwt: this library provides an HttpInterceptor which automatically attaches a JSON Web Token to HttpClient requests.
* coreui/coreui: CoreUI is an Open Source UI Kit built on top of Bootstrap 4.
* coreui/angular: CoreUI Angular libraries.
* ngx-translate/core: the internationalization (i18n) library for Angular.
* ngx-translate/http-loader: a loader for ngx-translate that loads translations using http.
* bootstrap: popular front-end framework for developing responsive and mobile first projects.
* core-js: modular standard library for JavaScript.
* ngx-bootstrap: native Angular Bootstrap components.
* rxjs: reactive extensions For JavaScript.
* rxjs-compat: reactive extensions For JavaScript.

### Development dependencies

* typescript: a language for application-scale JavaScript.
* angular-devkit/build-angular: Angular webpack build facade.
* angular/cli: CLI tool for Angular.
* angular/compiler-cli: Angular compiler CLI for Node.js.
* angular/language-service: Angular language service.
* jasmine-core: a behavior driven development testing framework for JavaScript.
* jasmine-spec-reporter: real time console spec reporter for Jasmine testing framework.
* types/jasmine: TypeScript definitions for jasmine.
* types/jasminewd2: TypeScript definitions for jasminewd2.
* types/node: TypeScript definitions for Node.js.
* codelyzer: a set of tslint rules for static code analysis of Angular TypeScript projects.
* karma: tool that allows you to execute JavaScript code in multiple real browsers..
* karma-chrome-launcher: Karma launcher for Chrome.
* karma-coverage-istanbul-reporter: Karma reporter.
* karma-jasmine: Karma adapter for Jasmine testing framework.
* karma-jasmine-html-reporter: reporter that dynamically shows tests results at debug.html page.
* protractor: webdriver E2E test wrapper for Angular.
* ts-node: TypeScript execution and REPL for node.js, with source map support.
* tslint: extensible static analysis linter for the TypeScript language.
* yargs: help build interactive command line tools.

## Directory structure

* e2e: end to end testing directory
* src: TypeScript source code, having the following structure:
  * app: application core
    * auth: authentication service functions for JSON web token (JWT) authentication strategy.
    * components: contains the custom application components.
    * containers: application containers (for example container like this: header, body, footer)
    * services: various services functions.
    * views: application views. Each view is contained in a folder with the following files: CSS file, HTML file, TypeScript file which defines the operating logic of the view and spec.ts file which defines a unit test. Some folders will be deleted in production (probably: base, buttons, chartjs, dashboard, notifications, theme, widgets).
  * assets: assets directory containing images, test API and translations.
    * api: test API (to be deleted when in production).
    * i18n: localization files in JSON format.
    * img: application images.
  * environments: development and production environment configuration files.
  * scss: SCSS files.

## Starting a development environment

### Prerequisites

* npm and node.js: first of all install npm and node.js (https://nodejs.org/it/download/)

* Angular CLI: install the Angular CLI (https://angular.io/guide/setup-local)

```sh
npm install -g @angular/cli
```

* GPP_backend: configure the GPP_backend environment, available at: (https://github.com/LedgerProject/GPP_backend)

### Configure the environment

Open a terminal and make a clone of this repository on your machine:

```sh
git clone https://github.com/LedgerProject/GPP_frontend
```

Install the npm packages. Go to the project directory and run:

```sh
npm install
```

After the modules installation, configure the environment. Open /src/environments/environment.ts (remember to edit also the /src/environments/environment.prod.ts) and edit the following parameters:

```sh
export const environment = {
  production: <true or false>,
  apiUrl: '<API url of GPP_backend>',
  apiPort: '<API port of GPP_backend>',
  imagesUrl: '<Images URL>',
  languages: [
    { 
      'name': '<language name>', 
      'value':'<language abbreviation>'
    }, { 
      'name': '<language name>',
      'value': '<language abbreviation>'
    }, { 
      'name': '<n language name>',
      'value': '<n language abbreviation>'
    }],
  messageExceptionInit: {
    name: '',
    status: 0,
    statusText: '',
    message: ''
  },
  messageErrorInit: {
    title : '',
    description : '' 
  }
};
```

Here an example

```sh
export const environment = {
  production: false,
  apiUrl: 'https://www.myawesomeapidomain.org',
  apiPort: '4200',
  imagesUrl: 'https://www.myawesomeimagesdomain.org',
  languages: [
    { 
      'name': 'English', 
      'value':'en'
    }, { 
      'name': 'Français',
      'value': 'fr'
    }],
  messageExceptionInit: {
    name: '',
    status: 0,
    statusText: '',
    message: ''
  },
  messageErrorInit: {
    title : '',
    description : '' 
  }
};
```

Finally run this script and wait that the service start:

```sh
ng serve
```

If everything went well, you should see something like this:

```sh
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
: Compiled successfully.
```

## Available scripts

To compile the project run:

```sh
npm run build
```

To clean the project run:

```sh
npm run clean
```

To run the project run:

```sh
npm start
```

## How the backend works

TODO