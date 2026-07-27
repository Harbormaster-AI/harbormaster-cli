const requestHandler	= require('./requesthandler');
const _           		= require('lodash');
var constants 			= require("./constants");
const Configstore 		= require('configstore');
const conf 				= new Configstore(constants.HARBORMASTER);
const Status 			= require("./status");
var util 				= require('util');
self = module.exports = {

	// handles checking the local configuration storage if the token exists in it, if so
	// the user has already been authenticated. For added security, the discovered key should
	// then be authenticated against the back end
	authenticated: () => {
		//conf.set(constants.HARBORMASTER_TOKEN, null); // for testing only to reset to retest authentication
		var token = conf.get(constants.HARBORMASTER_TOKEN);
		if( token == null ) 	
			return false;
		else 
			return true;
	},
	
	authenticate: (token, callback) => {

		return new Promise(function(resolve, reject) {

            const endpoint  = "findUserByToken";
            const body      = "internalIdentifier=" + token;

			return requestHandler.handleRequest( endpoint, body, function(err, data) {
		    	if ( err ) {
console.log(err)
		    		reject( util.format(constants.COMMAND_ERROR, constants.TOKEN_REQUEST_MSG) );
		    	} else {
		    		resolve( data );
		    	}
			}, false);
		});
	},

	userInfo: () => {
		return new Promise(async function(resolve, reject) {
			const endpoint  = "findUserByToken"
			const body      = 'internalIdentifier=' + conf.get("harbormaster.token");

			return requestHandler.handleRequest( endpoint, body, function(err, data) {
				if ( err ) {
					reject( err );
				} else if ( data != null ){
					resolve(data);
				}
			}, false);
		});
	},
	
	getToken : () => {
		   return conf.get(constants.HARBORMASTER_TOKEN);
	},

	storeToken : (token) => {
		conf.set(constants.HARBORMASTER_TOKEN, token);
	},

    getUserId: () => {
             		   return conf.get(constants.USER_ID);
             	},

	storeUserId : (userId) => {
		conf.set(constants.USER_ID, userId);
	}
}
