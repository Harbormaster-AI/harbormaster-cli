#!/usr/bin/env node
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";

const user				    = require('./lib/user');
const modelHandler		    = require('./lib/modelhandler');
const blueprintHandler	= require('./lib/blueprinthandler');
const resourceHandler	    = require('./lib/resourcehandler');
const archiveHandler	    = require('./lib/archivehandler');
const requestHandler	    = require('./lib/requesthandler');
const generateHandler	    = require('./lib/generatehandler');
const systemHandler	        = require('./lib/systemhandler');
const constants 		    = require("./lib/constants");
const Status 			    = require("./lib/status");
const status			    = new Status();

self = module.exports =  {

	// -------------------------------------------------
	// Handles the authentication of the user,
	// the user to provide their unique token, assigned
	// within their profile during registration
	// -------------------------------------------------		
	async authenticate (inputToken, hostUrl)  {

		return new Promise(async function(resolve, reject) {
			if ( inputToken ) {	// authenticate the token from the remote server
				const Configstore 	= require('configstore');
				const conf 			= new Configstore(constants.HARBORMASTER);

				// pull from the config
				if ( hostUrl == undefined || hostUrl == null || hostUrl.length == 0 ) { 
					var config 			= require('config');
					var serverConfig 	= config.get(constants.SERVER_CONFIG);
					var host 			= serverConfig.host;
//					var endPoint 		= serverConfig.endpoint;
//					var port			= serverConfig.port;
					
//					hostUrl = host + ':' + port + endPoint;
					hostUrl = host;
				}
				
				conf.set(constants.PLATFORM_URL, hostUrl);
				
				await user.authenticate(inputToken, function(err, data){
			    	if ( err )  {
			    		reject( status.error(err, constants.TOKEN_VALIDATION_ERROR ) );
			    	}else {
			    		if ( data != null && data.resultCode == constants.SUCCESS ) {
// server returns redacted token value			    			if (inputToken == JSON.parse(data.result).token) {

			    				user.storeToken(inputToken);	// authenticated
			    				resolve( data );
//			    			}
			    		} 
			    		else
			    			reject( status.error("", constants.TOKEN_VALIDATION_ERROR ) ); 
			    	}
			    });
			}
			else
				reject( status.error("", constants.TOKEN_VALIDATION_ERROR ) );
		});
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

	// -------------------------------------------------
	// Model Related Functions
	// -------------------------------------------------

	listModels : (filter) => {
		return new Promise(function(resolve, reject) {
			modelHandler.list(filter)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},
/*
	validateModel : (file, javaRootPackageName) => {	
		return new Promise(function(resolve,reject) {
			modelHandler.validate(file, javaRootPackageName)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},
	
	registerModel : (yamlFile, name, scope, javaRootPackageName, primaryKeyPattern ) => {	
		return new Promise(function(resolve,reject) {
			if ( yamlFile == null )
				reject( status.error(null, "Invalid YAML file provided." ));
			else {				
				modelHandler.register(yamlFile, name, scope == null ? constants.PRIVATE : scope, javaRootPackageName, primaryKeyPattern )
					.then(function(result) {
						resolve( result );
				}).catch(err => reject(err));
			}
		});
	},
	
	downloadModel : (model_id_or_name, output_file_path) => {
		return new Promise(function(resolve,reject) {
			modelHandler.downloadModel( model_id_or_name, output_file_path )
				.then(function(result) {
					resolve(result);
			}).catch(err => reject(err));
		});
	},
	
	deleteModel (model_id_or_name)  {
		return new Promise(function(resolve,reject) {
			modelHandler.deleteModel(model_id_or_name)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},
	
	promoteModel (model_id_or_name) {
		return new Promise(function(resolve,reject) {
			modelHandler.promoteModel(model_id_or_name)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
		
	},

	demoteModel (model_id_or_name) {
		return new Promise(function(resolve,reject) {
			modelHandler.demoteModel(model_id_or_name)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
		
	},
*/

	// -------------------------------------------------
	// Blueprint Related Functions
	// -------------------------------------------------
	
	listBlueprints  : (filter) => {	
		
		return new Promise(function(resolve, reject) {
			blueprintHandler.list(filter)
				.then(function(result) {
					resolve(result);
			}).catch(err => reject(err));
		});
	},
/*
	validateBlueprint : (file) => {	
		return new Promise(function(resolve, reject) {
			blueprintHandler.validate(file)
				.then(function(result) {
					resolve(result);
			}).catch(err => reject(err));
		});
	},

	registerBlueprint : (yamlFile, scope) => {	
		return new Promise(function(resolve, reject) {
			if ( yamlFile == null )
				reject( status.error(null, "Invalid YAML file provided." ) );
			else {
				blueprintHandler.register(yamlFile, scope == null ? constants.PRIVATE : scope)
				 .then(function(result) {
						resolve( result );
				}).catch(err => reject(err) );
			}
		});
	},
*/
	blueprintOptions : (stack_name_or_id) => {
		return new Promise(function(resolve, reject) {
			blueprintHandler.options(stack_name_or_id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},
/*
	downloadBlueprint : (stack_name_or_id, output_file_path) => {
		return new Promise(function(resolve, reject) {
			blueprintHandler.downloadBlueprint( stack_name_or_id, output_file_path )
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},
	
	async deleteBlueprint (stack_name_or_id) {
		return new Promise(function(resolve, reject) {
			blueprintHandler.deleteBlueprint(stack_name_or_id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},
	
	promoteBlueprint (stack_name_or_id) {
		return new Promise(function(resolve, reject) {
			blueprintHandler.promoteBlueprint(stack_name_or_id)
				.then(function(result) {
					resolve( result );
				}).catch(err => reject(err));
		});
	},

	demoteBlueprint (stack_name_or_id) {
		return new Promise(function(resolve, reject) {
			blueprintHandler.demoteBlueprint(stack_name_or_id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},
*/
	// -------------------------------------------------
	// Resource Related Functions
	// -------------------------------------------------
/*
	listResources : (scope, resourceType) => {	
		return new Promise(function(resolve, reject) {
			resourceHandler.list(scope, resourceType)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},

	registerResource : (resourceFile, uniqueName, type, cost, scope) => {	
		return new Promise(function(resolve,reject) {
			if ( resourceFile == null )
				reject( status.error(null, "Empty or invalid resource file provided." ));
			else if ( cost==null || Number(cost) === Number.NaN )
				reject( status.error(null, "Empty or invalid cost provided" ));
			else {
				resourceHandler.register(resourceFile, uniqueName, type, cost, scope == null ? constants.PRIVATE : scope)
					.then(function(result) {
						resolve( result );
				}).catch(err => reject(err));
			}
		});
	},
	
	downloadResource : (resource_name_or_id, output_file_path) => {
		return new Promise(function(resolve,reject) {
			resourceHandler.downloadResource( resource_name_or_id, output_file_path )
				.then(function(result) {
					resolve(result);
			}).catch(err => reject(err));
		});
	},
	
	deleteResource (resource_name_or_id)  {
		return new Promise(function(resolve,reject) {
			resourceHandler.deleteResource(resource_name_or_id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
	},
	
	promoteResource (resource_name_or_id) {
		return new Promise(function(resolve,reject) {
			resourceHandler.promoteResource(resource_name_or_id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
		
	},

	demoteResource (resource_name_or_id) {
		return new Promise(function(resolve,reject) {
			resourceHandler.demoteResource(resource_name_or_id)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});
		
	},
	
*/
	// -------------------------------------------------
	// System Related Functions
	// -------------------------------------------------
	
	generateSystem : (yamlFilePath, gitFile, appOptionsFile, modelIdentifier) => {	
		return new Promise(function(resolve, reject) {
			generateHandler.generateSystem(yamlFilePath, gitFile, appOptionsFile, modelIdentifier)
				.then(function(result) {
					resolve( result );
				}).catch(err => reject(err));
		});
	},
/*
	saveSystem : (yamlFilePath, name) => {
		return new Promise(function(resolve,reject) {
			systemHandler.saveSystem(yamlFilePath, name)
				.then(function(result) {
					resolve( result );
				}).catch(err => reject(err));
		});
	},
*/
    listSystem : () => {
        return new Promise(function(resolve,reject) {
            systemHandler.listSystem()
                .then(function(result) {
                    resolve( result );
                }).catch(err => reject(err));
        });
    },
/*
	promoteSystem (project_id_or_name) {
		return new Promise(function(resolve,reject) {
			systemHandler.promoteSystem(project_id_or_name)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});

	},

	demoteSystem (project_id_or_name) {
		return new Promise(function(resolve,reject) {
			systemHandler.demoteSystem(project_id_or_name)
				.then(function(result) {
					resolve( result );
			}).catch(err => reject(err));
		});

	},
*/
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
/*
	promoteApp : (app_name_or_id) => {
		return new Promise(function(resolve,reject) {
			archiveHandler.promoteApp(app_name_or_id)
				.then(function(result) {
					resolve( result );
				}).catch(err => reject(err));
		});
	},

	demoteApp : (app_name_or_id) => {
		return new Promise(function(resolve,reject) {
			archiveHandler.demoteApp(app_name_or_id)
				.then(function(result) {
					resolve( result );
				}).catch(err => reject(err));
		});
	},
*/

}