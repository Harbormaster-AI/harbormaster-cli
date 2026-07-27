const user			    = require('./user');
const requestHandler	= require('./requesthandler');
const fileHandler		= require('./filehandler');
const modelHandler		= require('./modelhandler');
const techStackHandler	= require('./blueprinthandler');
var constants 			= require("./constants");
var util 				= require('util');
const Configstore 		= require('configstore');
const conf 				= new Configstore(constants.HARBORMASTER);
const Status 			= require("./status");
const status			= new Status();

module.exports = {

	generateSystem: (yamlFile) => {

		return new Promise(async function(resolve, reject) {

			let systemAsCode = null;

			fileHandler.loadYMLToJSON(yamlFile, function( err, data ){

				if ( err ) {
					reject( status.error( err, "Error parsing system-as-code yaml file " + yamlFile + " to json."));
					return;
				}
				systemAsCode = data;

			});

            if ( systemAsCode == null ) {
                reject( "Failed to load system-a-code yaml file.");
                return;
            }

			if ( systemAsCode != null ) {

                var deleteOption = 'ALWAYS';

                if ( user.authenticated() )
                    deleteOption = 'NEVER';

                var endpoint    = "generateSystem";
                var system      = systemAsCode.system;
                var body = { // the back end still uses project while outside the backend, system is used
                            userId:                     116, //user.getUserId(),
                            deleteOptions:              deleteOption,
                            name:                       system.name == null ? reject( "system->name cannot be empty") : system.name,
                            description:                system.description == null ? reject( "system->description cannot be empty") : system.description,
                            blueprintName:              system.blueprint.name == null ? reject( "system->blueprint->name cannot be empty") : system.blueprint.name,
                            modelName:                  system.model.name == null ? reject( "system->model->name cannot be empty") : system.model.name,
                            aws:                        system.aws,
                            kubernetes:                 system.kubernetes,
                            docker:                     system.docker,
                            git:                        system.git,
                            terraform:                  system.terraform,
                            systemInputOptions:         system.options
                            }

                // ------------------------------------------
                // check for application values
                // ------------------------------------------
                if ( system.options.application.name == null ) {
                    reject( "Application name cannot be empty" );
                    return;
                }

                // ------------------------------------------
                // check for github values
                // ------------------------------------------
                if ( system.git.owner == null ) {
                    reject( "Git owner cannot be empty" );
                    return;
                }

                if ( system.git.password == null ) {
                    reject( "Git password cannot be empty." );
                    return;
                }

                if ( system.git.host == null ) {
                    reject( "Git host cannot be empty" );
                    return;
                }

                if ( system.git.repository == null ) {
                    reject( "Git repository cannot be empty" );
                    return;
                }

                var endpoint = "generateSystem"
                return requestHandler.handleRequest( endpoint, body, function(err, data) {
                    if ( err ) {
                        reject( status.error(err,
                                util.format(constants.COMMAND_ERROR, constants.MODEL_LIST_REQUEST_MSG) ));
                    }
                    else {
                        if ( data?.success == undefined ) {
                            const p = module.exports.provenance( system, data );
                            resolve( p );
                        }
                        else
                            resolve( data );
                    }
                }, true);
			}

		});

    },

    provenance: (system, build) => {
        const results = {
                        generator:          "Harbormaster CLI",
                        cliVersion:         "1.2.0",
                        commitSHA:          build.commitSHA ?? "",
                        blueprint:          system.blueprint.name ?? "",
                        domainModel:        system.model.name ?? "",
                        cloud:              "AWS",
                        terraform:          system.terraform.inUse ?? "",
                        kubernetes:         system.kubernetes.inUse ?? "",
                        generationId:       build.buildIdentifier  ?? "",
                        certificationId:    build.certification.certificationIdentifier  ?? "",
                        repository:         system.git.owner + '/'  + system.git.repository,
                        totalFiles:         build.generateAppStats.totalFilesProcessed.toLocaleString(),
                        totalLOCs:          build.generateAppStats.totalLines.toLocaleString(),
                    }
        return results;
    }

}