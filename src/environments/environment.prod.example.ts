export const environment = {
  production: true,
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
