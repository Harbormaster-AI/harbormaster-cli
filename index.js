#!/usr/bin/env node
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";

const user				    = require('./lib/user');
const modelHandler		    = require('./lib/modelhandler');
const blueprintHandler	    = require('./lib/blueprinthandler');
const resourceHandler	    = require('./lib/resourcehandler');
const archiveHandler	    = require('./lib/archivehandler');
const requestHandler	    = require('./lib/requesthandler');
const generateHandler	    = require('./lib/generatehandler');
const systemHandler	        = require('./lib/systemhandler');
const constants 		    = require("./lib/constants");
const Status 			    = require("./lib/status");
const status			    = new Status();
const Configstore 		    = require('configstore');


self = module.exports =  {

    authenticated() {
        return user.authenticated();
    },

	// -------------------------------------------------
	// Handles the authentication of the user,
	// the user to provide their unique token, assigned
	// within their profile during registration
	// -------------------------------------------------		
	async authenticate (inputToken, hostUrl)  {

			if ( inputToken ) {	// authenticate the token from the remote server

				// pull from the config
                var config 			= require('config');
                var serverConfig 	= config.get(constants.SERVER_CONFIG);
                var host 			= self.endpoint();

                // use what was provided since it take precedent but do not store it
                if ( hostUrl )
                    host = hostUrl;

                return new Promise(function(resolve, reject) {
                    user.authenticate(inputToken)
                        .then(function(result) {
                            user.storeToken( inputToken );	// authenticated for future API calls
                            user.storeUserId( result.id )   // some APIs need a valid user identifier
                            resolve( result );
                    }).catch(err => reject(err));
                });
			}
			else
				reject( status.error("", constants.TOKEN_VALIDATION_ERROR ) );
	},

	// -------------------------------------------------
	// Model Related Functions
	// -------------------------------------------------

	userInfo : () => {

		return new Promise(function(resolve, reject) {
			user.userInfo()
				.then(function(result) {
					resolve(result);
			}).catch(err => reject(err));
		});
	},

    endpoint : () => {

        const conf 				    = new Configstore(constants.HARBORMASTER);

        const platformUrl =
            process.env.PLATFORM_URL ||
            conf.get("endpoint") ||
            "https://platform.harbormaster.net";

        return platformUrl;
    },

	// -------------------------------------------------
	// Model Related Functions
	// -------------------------------------------------

	listModels : (filter, category, industry) => {
		return new Promise(function(resolve, reject) {
			modelHandler.list(filter, category, industry)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},


	modelIndustries : () => {
		return new Promise(function(resolve, reject) {
			modelHandler.industries()
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},

	modelCategories : () => {
		return new Promise(function(resolve, reject) {
			modelHandler.categories()
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},

	// -------------------------------------------------
	// Model Related Functions
	// -------------------------------------------------

	modelProfile : (id) => {
		return new Promise(function(resolve, reject) {
			modelHandler.profile(id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},

	// -------------------------------------------------
	// Blueprint Related Functions
	// -------------------------------------------------
	
	listBlueprints  : (filter, category) => {
		
		return new Promise(function(resolve, reject) {
			blueprintHandler.list(filter, category)
				.then(function(result) {
					resolve(result);
			}).catch(err => reject(err));
		});
	},

	blueprintProfile : (id) => {
		return new Promise(function(resolve, reject) {
			blueprintHandler.profile(id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},

	blueprintOptions : (id) => {
		return new Promise(function(resolve, reject) {
			blueprintHandler.options(id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},

	// -------------------------------------------------
	// System Related Functions
	// -------------------------------------------------
	
	generateSystem : (yamlFilePath) => {
		return new Promise(function(resolve, reject) {
			generateHandler.generateSystem(yamlFilePath)
				.then(function(result) {
					resolve( result );
				}).catch(err => reject(err));
		});
	},

    listSystems: () => {
        return new Promise(function(resolve,reject) {
            systemHandler.list()
                .then(function(result) {
                    resolve( result );
                }).catch(err => reject(err));
        });
    },

    deleteSystem: (name) => {
        return new Promise(function(resolve,reject) {
            systemHandler.delete(name)
                .then(function(result) {
                    resolve( result );
                }).catch(err => reject(err));
        });
    },

	// -------------------------------------------------
	// Archive Related Functions
	// -------------------------------------------------
	
	listBuilds : (system_id) => {
		return new Promise(function(resolve, reject) {
			archiveHandler.listBuilds(system_id)
				.then(function(result) {
					resolve( result );
				}).catch(err => reject(err));
		});
	},
	
	downloadBuild : (system_id, build_id, output_file_path) => {
		archiveHandler.downloadApp(system_id, build_id, output_file_path)
			.then(function(result) {
				resolve( result );
			}).catch(err => reject(err));
	},
	
	deleteBuild : (system_id, build_id) => {
		return new Promise(function(resolve,reject) {
			archiveHandler.deleteApp(system_id, build_id)
				.then(function(result) {
					resolve( result );
				}).catch(err => reject(err));
		});
	},

}