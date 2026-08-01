const inquirer   	= require('inquirer');
const constants		= require('./constants');
const harbormaster      = require('@system-as-code/sdk');

let self = module.exports = {

  askCredentials: () => {
    const questions = [
      {
        name: 'tokenInput',
        type: 'input',
        message: 'Enter your token, available from your Harbormaster admin\n or your account at ' + harbormaster.endpoint()  + ':',
        validate: function( value ) {
        	return value ? true : false;
        }
      },
      {
          name: 'hostUrl',
          type: 'input',
          message: 'Enter host url or leave empty to use localhost:',
          validate: function( value ) {
          	return true;
          }
        },
      
    ];
    return inquirer.prompt(questions);
  },

  confirmation: (quiet) => {
    if ( quiet == 'true' )
       return {query: true};
    else
        return self.confirmationHelper();
  },
  
  confirmationHelper: () => {
    const confirm = [
      {
        name: 'query',
        type: 'confirm',
        message: 'Are you sure you?',
        validate: function( value ) {
        	return value ? true : false;
        }
      }
    ];
    return inquirer.prompt(confirm);
  }
}