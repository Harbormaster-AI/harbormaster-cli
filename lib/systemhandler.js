const requestHandler	= require('./requesthandler');
const fileHandler		= require('./filehandler');
const modelHandler		= require('./modelhandler');
const user			    = require('./user');
var constants 			= require("./constants");
var util 				= require('util');
const Configstore 		= require('configstore');
const conf 				= new Configstore(constants.HARBORMASTER);
const Status 			= require("./status");
const status			= new Status();

let self = module.exports = {

	list: () => {
		return new Promise(function(resolve, reject) {
			const endpoint = "marketplaceSystemsView"
			const body = 'status=Active&sortBy=name&filter=ownerId=' + user.getUserId();
			return requestHandler.handleRequest( endpoint, body, function(err, data) {
				if ( err ) {
		    		reject( status.error(err,
							util.format(constants.COMMAND_ERROR, constants.MODEL_LIST_REQUEST_MSG) ));
		    	}else {
		    		resolve( data );
		    	}
			});
		}, false);
	},

 	delete: (name) => {
 		return new Promise(async function(resolve, reject) {
			const endpoint = "deleteProject"
			const body = 'projectId=' + name

 			return requestHandler.handleRequest( endpoint, body, function(err, data) {
 				if ( err ) {
 					reject( status.error(err,
 											util.format(constants.COMMAND_ERROR, constants.DELETE_SYSTEM)));
 				} else if ( data != null ){
 					resolve(data);
 				}
 			}, false);
 		});
 	},

/*
	saveSystemHelper: (appParams, blueprintId, modelId, saveParams) => {
		return new Promise(async function(resolve, reject) {
            // ================================================================
			// prep the input payload and apply the user token
            // ================================================================
			var input 				    = requestHandler.packageInputAddToken(constants.REGISTER_SYSTEM);
	
			input.blueprintPackageId 	= blueprintId;
			input.modelId 				= modelId;			

            // ================================================================
            // assign the application options
            // ================================================================
            input.appOptions = appParams.options;
            
            // ================================================================
            // in the event a GIT or JAR/WAR/EAR file is being supplied as the model, 
            // need the pojo params
            // ================================================================
            if ( appParams.model.javaRootPackageNames != null )
                input.pojoParams = {"javaRootPackageNames":appParams.model.javaRootPackageNames, "primaryKeyPattern": appParams.model.primaryKeyPattern};
                        
            // ================================================================
            // assign save params
            // ================================================================
            input.saveParams = saveParams;

            // ================================================================
            // assign Git params directly
            // ================================================================
            input.gitParams	= appParams.options.git;

            // ================================================================
			// assign the System name
			// ================================================================
		    var SystemName = appParams.name;

			if ( input.appOptions != null ) {
				var msg = util.format(constants.SYSTEM_SAVE_REQUEST_MSG, SystemName);
				var reqPromise = requestHandler.asyncHandleRequest( input, msg);
				
				reqPromise.then(function(data) {
					if ( data.resultCode != constants.SUCCESS)
						reject(data)
					else {
						resolve( data );
					}
				}, function(err) {
					reject( err );
				}).catch(err => console.log('Catch', err));
			}
		});
	},
	
	saveSystem: (yamlFile) => {
		
		return new Promise(async function(resolve, reject) {
	
			let genYamlAsJson = null;
			
            // ================================================================
            // load the YAML into JSON
            // ================================================================
			fileHandler.loadYMLToJSON(yamlFile, function( err, data ){

				if ( err ) {
					reject( status.error( err, "Error parsing System-as-code yaml file " + yamlFile + " to json."));
					return;
				}
				genYamlAsJson = data;
								
			});
			
			if ( genYamlAsJson != null ) {
	
				let blueprintId, modelIdentifierToUse, appParams, saveParams;
				
                // ==============================================
				// support starting with app or System
                // ==============================================
				if ( genYamlAsJson.app != undefined ) {
					if ( genYamlAsJson.app.length == undefined )
				    	appParams = genYamlAsJson.app;				    
					else
				    	 appParams = genYamlAsJson.app[0];
				}
				else if ( genYamlAsJson.System != undefined ) {
					if ( genYamlAsJson.System.length == undefined )
				    	appParams = genYamlAsJson.System;				    
					else
				    	appParams = genYamlAsJson.System[0];
				} 
				else {
					reject( status.error( null, "Error parsing gen app yaml file due to missing start of either app or System." ));
					return;
				}

                // ==============================================
				// assign the model identifier
                // ==============================================
	   			modelIdentifierToUse = appParams.model.name;

                // ==============================================
				// assign the tech stack identifier
                // ==============================================
				blueprintId = appParams.blueprint.name;

                // ==============================================
				// assign the save params
                // ==============================================
                saveParams = {"name":appParams.name, "description":appParams.description};

                self.saveSystemHelper(appParams, blueprintId, modelIdentifierToUse, saveParams)
                    .then(function(result) {
                        resolve(result);
                    }).catch(err => reject(err));
			}
		});
	},

    promoteSystem: (name_or_id) => {
        return new Promise(async function(resolve, reject) {

            const input = requestHandler.packageInputAddToken(constants.PROMOTE_SYSTEM);

            input.modelId 		= name_or_id;

            return requestHandler.handleRequest( input, constants.PROMOTE_SYSTEM_REQUEST_MSG, function(err, data) {
                if ( err ) {
                    reject( status.error(err,
                            util.format(constants.COMMAND_ERROR, constants.PROMOTE_MODEL)));
                } else if ( data != null ){
                    resolve( data );
                }
            });
        });
    },

    demoteSystem: (name_or_id) => {
        return new Promise(async function(resolve, reject) {

            const input = requestHandler.packageInputAddToken(constants.DEMOTE_SYSTEM);

            //if ( Number.isNaN(name_or_id) )
                input.modelId 		= name_or_id;
            //else
                //input.saveParams	= {"name":name_or_id};

            return requestHandler.handleRequest( input, constants.DEMOTE_SYSTEM_REQUEST_MSG, function(err, data) {
                if ( err ) {
                    reject( status.error(err,
                            util.format(constants.COMMAND_ERROR, constants.DEMOTE_SYSTEM)));
                } else if ( data != null ){
                    resolve( data );
                }
            });
        });
    }, */
}
