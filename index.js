#!/usr/bin/env node

const chalk     		= require('chalk');
const clear   			= require('clear');
const figlet   			= require('figlet');
const harbormaster		= require('harbormaster-api');
const inquirer			= require('./lib/inquire');
var constants 			= require("./lib/constants");
const Configstore 		= require('configstore');
const conf 				= new Configstore(constants.HARBORMASTER);
const Table   			= require('cli-table')

////////////////////////////////////////////////////
// Function Definitions
////////////////////////////////////////////////////

////////////////////////////////////////////////////
// handles the authentication of the user, requiring
// the user to provide their unique token, assigned
// within their profile during registration
////////////////////////////////////////////////////

var program = require('commander');

program
.version('2.1.0', '-v, --version')
.option('-q, --quiet [arg]', 'true or [false] to minimize output to only results.', 'false');

program
.command('init [token] [hostUrl]')
.description('Must run first to initialize Harbormaster. If you do not provide a token, you will be prompted for one.  ' + 
		'If the hostUrl is not provided, localhost:8080 will be assumed. ' +
		'The Host Url takes the form http://<host_name>:<port>. ' +
		'The Url is easiest verified in your browser.')
.action(async function(token, hostUrl){
	console.log( chalk.black(
		    figlet.textSync('Harbormaster', { horizontalLayout: 'default', verticalLayout: "default" })
		)
	);

	var theToken;
	if ( token != null ) {
		theToken = token;
	}
	else {
		var input = await inquirer.askCredentials();		// ask for the token and host Url
		theToken = input.tokenInput;
		if ( input.hostUrl != null && input.hostUrl != undefined && input.hostUrl.length != 0 )
			hostUrl = input.hostUrl + '/service';
		else
			hostUrl = 'http://localhost:8080/harbormaster/service';
	}

	harbormaster.authenticate(theToken, hostUrl)
			.then(function(result) {
				console.log( result.processingMessage );
			}).catch(err => console.log(err));
});

////////////////////////////////////////////////////
// user related options
////////////////////////////////////////////////////

program
.command('user_info')
.description('Information about the signed in user.')
.action(function(){
	harbormaster.userInfo()
		.then(function(data) {
			console.log( data );
		}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Gets information about the signed in user.');
    console.log('');
    console.log('Example to get current user information:');
    console.log('');
    console.log('  $ harbormaster user_info');
    console.log('');
    
});

////////////////////////////////////////////////////
// model related options
////////////////////////////////////////////////////
/*program
.command('model_types_supported')
.description('List of supported model types.')
.action(function(scope, options){
	console.log( "Supported Model Types:" );
	console.log( "-- YAML(.yaml, .yml)" );
	console.log( "" );
}).on('--help', function() {
    console.log('');
    console.log('Example to display all supported model types:');
    console.log('');
    console.log('  $ harbormaster model_types_supported');
});*/

program
.command('list_models [scope]')
.description('List available models. Scope: All, Harbormaster, Mine.')
.option('-o, --output [value]', '[json] or pretty for pretty print')
.action(function(scope, options){
	harbormaster.listModels()
		.then(function(data) {
			var models = JSON.parse(data.result);
			if ( options.output == constants.PRETTY_PRINT_OUTPUT) {
				const tbl 		= new Table({
											head: ['name', 'description', 'file', 'contributor'],
											colWidths: [20, 30, 25, 25]
										});
				var saveParams;
				for(var index = 0; index < models.length; index++ ) {
					saveParams = JSON.parse(models[index].saveParams);
						tbl.push( 
								[
									saveParams.name,
									saveParams.description, 
									models[index].fileName, 
									models[index].contributor
								]);
				}
				console.log(tbl.toString());
			}
			else {
					console.log(models);
			} 
	}).catch(err => console.log(err));
	
}).on('--help', function() {
    console.log('');
    console.log('Example to display all public models using pretty print:');
    console.log('');
    console.log('  $ harbormaster model_list --output pretty');
    console.log('');
    console.log('Example to display all Harbormaster and your models as json [default]:');
    console.log('');
});


/*program
.command('validate_model <filepath>')
.description('Validate a model for possible usage later on.)
.action(function(filepath){
	harbormaster.validateModel(filepath)
		.then(function(data) {
			console.log(data);
		}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Loads and validates a model file content.');
    console.log('');
    console.log('Example to validate a YAML model file:');
    console.log('');
    console.log('  $ harbormaster model_validate ./models/mymodel.yml');
    console.log('');
    
});*/

/*program
.command('publish_model <model_file> <name> <description>')
.description('Publish a model file. name: unique name, description: )
.action(function(model_file, name, description){
	var array;
	harbormaster.registerModel(model_file, name, description)
		.then(function(data) {
			console.log("model publishing complete");
		}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to publish a model :');
    console.log('');
    console.log('  $ harbormaster model_publish ./my-model.yaml mySystem "this is my first model" ');
    console.log('');
});*/

/*program
.command('download_model <name> <output_file_path>')
.description('Download a model file you are the owner of. name: name saved as, output_file_path: where to save it to' )
.action(function(name, output_file_path){
	harbormaster.downloadModel(name, output_file_path)
		.then(function(data){
			console.log(data);
		}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to download a model with name myModel:');
    console.log('');
    console.log('  $ harbormaster model_download myModel ./tmp/archive/mymodel.xmi');
    
});*/

/*program
.command('model_promote <name>')
.description('Promote an owned model from private scope to public.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true )
		harbormaster.promoteModel(name)
			.then(function(data){
				console.log(data);
		}).catch(err => console.log(err));
	else
		console.log( confirm );
}).on('--help', function() {
    console.log('');
    console.log('Example to promote a model referenced by name myModel:');
    console.log('');
    console.log('  $ harbormaster model_promote myModel');    
});*/

/*program
.command('model_demote <name>')
.description('Demote an owned model from public scope to private.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true )
		harbormaster.demoteModel(name)
			.then(function(data){
				console.log(data);
			}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to demote a model referenced by name myModel:');
    console.log('');
    console.log('  $ harbormaster model_demote myModel');    
});*/

/*program
.command('delete_model <name>')
.description('Delete a model.  Can only delete a model you own. name: names saved as when created.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true )
		harbormaster.deleteModel(name)
			.then(function(data){
				console.log(data);
			}).catch(err => console.log(err));				
}).on('--help', function() {
    console.log('');
    console.log('Example to delete a model:');
    console.log('');
    console.log('  $ harbormaster model_delete myModel');    
});*/

////////////////////////////////////////////////////
// tech stack related options
////////////////////////////////////////////////////
    	
program
.command('list_blueprints [hint]')
.description('List available blueprints: hint: used to filter')
.option('-o, --output [type]', '[json] or pretty for pretty print')
.action(function(hint, options){
	harbormaster.listBlueprints(hint)
	.then(function(data) {
		var pkgs = JSON.parse(data.result);
		if ( options.output == constants.PRETTY_PRINT_OUTPUT) {
			const tbl 		= new Table({
										head: [ 'name','version', 'description'],
										colWidths: [35, 20, 150]
									});
			var saveParams;
			for(var index = 0; index < pkgs.length; index++ ) {
				saveParams = JSON.parse(pkgs[index].saveParams);
				tbl.push( 	
							[
								saveParams.name,
								pkgs[index].version,
								saveParams.description,
								//pkgs[index].contributor,
								//pkgs[index].scope,
							//	pkgs[index].productLine,
							//	pkgs[index].status
							] );
			}
			console.log(tbl.toString());
		}
		else {
				console.log(pkgs);
		} 
	});
}).on('--help', function() {
    console.log('');
    console.log('Example to display all blueprints:');
    console.log('');
    console.log('  $ harbormaster list_blueprints');
    console.log('');
    console.log('Example to display all blueprints that contain the word "spring" in its name or metadata');
    console.log('');
    console.log('  $ harbormaster list_blueprints spring');
});

program
.command('blueprint_input_options')
.description('Available user input options, modifiable to allow customization of a generated app.')
.action(function(name){
	harbormaster.blueprintOptions(name)
		.then(function(data){
			if ( program.quiet == 'true' )
				console.log(data.result);
			else
				console.log(data);
	}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to download the app options for the associated tech stack');
    console.log('into a JSON file:');
    console.log('');
    console.log('  $ harbormaster stack_options --quiet true 1 > app.options.json');
    console.log('');    
});

/*program
.command('validate_blueprint <filepath>')
.description('Validate a tech stack for usage later on.')
.action(function(filepath){
	harbormaster.validateTechStack(filepath)
		.then(function(data){
			console.log(data);
	}).catch(err => console.log(err));

}).on('--help', function() {
    console.log('');
    console.log('Validates the structure and contents of a tech stack package (ZIP file).');
    console.log('');
    console.log('Example to validate a tech stack zip file:');
    console.log('');
    console.log("  $ harbormaster stack_validate './samples/techstacks/AWS_Lambda_RDS_Modified.zip'");
    console.log('');
    
});*/

/*program
.command('stack_publish <yaml_file> [scope]')
.description('Publish a stack using YAML directives. Scope: public or private [default].')
.action(function(yaml_file, scope){
	harbormaster.registerTechStack(yaml_file, scope)
		.then(function(data){
			console.log(data);
	}).catch(err => console.log(err));
	
}).on('--help', function() {
    console.log('');
    console.log('Example to publish a tech stack as public:');
    console.log('');
    console.log('  $ harbormaster stack_publish ./yamls/save-my-techstack.yml public');
    console.log('');
    
});*/

/*program
.command('stack_download <name> <output_file_path>')
.description('Download a tech stack as a ZIP file.  Only owned or public stacks can be downloaded.' )
.action(function(name, output_file_path){
	harbormaster.downloadStack(name, output_file_path)
		.then(function(data){
			console.log(data);
	}).catch(err => console.log(err));
	
}).on('--help', function() {
    console.log('');
    console.log('Example to download a tech stack referenced by name myStack:');
    console.log('');
    console.log('  $ harbormaster stack_download myStack ./tmp/archive/mystack.zip');
    
});*/


/*program
.command('stack_promote <name>')
.description('Promote an owned tech stack from private scope to public.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true ) {
		harbormaster.promoteStack(name)
			.then(function(data){
				console.log(data);
		}).catch(err => console.log(err));
		
	}
}).on('--help', function() {
    console.log('');
    console.log('Example to promote a tech stack referenced by name myStack:');
    console.log('');
    console.log('  $ harbormaster stack_promote myStack');    
});*/


/*program
.command('stack_demote <name>')
.description('Demote an owned tech stack from public scope to private.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true ) {
		harbormaster.demoteStack(name)
			.then(function(data){
				console.log(data);
		}).catch(err => console.log(err));
		
	}
}).on('--help', function() {
    console.log('');
    console.log('Example to promote a tech stack referenced by name myStack:');
    console.log('');
    console.log('  $ harbormaster stack_promote myStack');    
});*/

/*program
.command('stack_delete <name>')
.description('Delete a tech stack.  Can only delete an owned private tech stack.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true ) {
		harbormaster.deleteStack(name)
			.then(function(data){
				console.log(data);
		}).catch(err => console.log(err));
	}
}).on('--help', function() {
    console.log('');
    console.log('Example to delete a tech stack referenced by name myStack:');
    console.log('');
    console.log('  $ harbormaster stack_delete myStack');    
});*/

////////////////////////////////////////////////////
// resource related options
////////////////////////////////////////////////////

/*program
.command('resource_list [scope]')
.description('List available resources. Scope: public, private, community. Empty returns all.')
.option('-o, --output [value]', '[json] or pretty for pretty print')
.option('-t, --type [value]', 'GENERIC [default], DOCKERFILE, CI_CONFIG, TERRAFORM, PROJECT_AS_CODE')
.action(function(scope, options){
	harbormaster.listResources(scope, options.type)
		.then(function(data) {
			var resources = JSON.parse(data.result);
			if ( options.output == constants.PRETTY_PRINT_OUTPUT) {
				const tbl 		= new Table({
											head: ['name', 'file', 'contributor', 'type', 'scope'], 
											colWidths: [15, 50, 50, 20, 20]
										});
				var saveParams;
				for(var index = 0; index < resources.length; index++ ) {
					saveParams = JSON.parse(resources[index].saveParams);
						tbl.push( 
								[
									saveParams.name, 
									resources[index].fileName, 
									resources[index].contributor,
//									resources[index].cost,
									resources[index].resourceType,
									resources[index].scopeType
								]);
				}
				console.log(tbl.toString());
			}
			else {
					console.log(resources);
			} 
	}).catch(err => console.log(err));
	
}).on('--help', function() {
    console.log('');
    console.log('Example to display all public resources using pretty print:');
    console.log('');
    console.log('  $ harbormaster resource_list public --output pretty');
    console.log('');
    console.log('Example to display all your public and private list as json [default]:');
    console.log('');
    console.log('  $ harbormaster resource_list');
    console.log('Example to display all community Dockerfile resources as json :');
    console.log('');
    console.log('  $ harbormaster resource_list community -t DOCKEFILE');    
});*/

/*program
.command('resource_publish <resource_file> <unique_name> <type> [scope]')
//.command('resource_publish <resource_file> <unique_name> <type> [cost] [scope]')
.description('Publish a resource file. type: DOCKERFILE, CI_CONFIG, TERRAFORM, GENERIC; scope: public or private[default].' )
.action(function(resource_file, unique_name, type, cost, scope){
	harbormaster.registerResource(resource_file, unique_name, type, 0.0, scope)
		.then(function(data) {
			console.log(data);
		}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to publish a resource as private at a cost of $1.00 USD:');
    console.log('');
    console.log('  $ harbormaster resource_publish ./some_path/Dockerfile myFirstDockerFile DOCKERFILE 1.00');
    console.log('');
    console.log('Example to publish a CI Config file as public @ no cost:');
    console.log('');
    console.log('  $ harbormaster resource_publish ./some_path/config.yml myFirstCircleCIConfigYAML CI_CONFIG public 0.0');
    console.log('');
    
});*/

/*program
.command('resource_download <name> <output_file_path>')
.description('Download a resource file.  Only owned or public models can be downloaded.' )
.action(function(resource_id, output_file_path){
	harbormaster.downloadResource(resource_id, output_file_path)
		.then(function(data){
			console.log(data);
		}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to download a resource with name myResource:');
    console.log('');
    console.log('  $ harbormaster resource_download myResource ./tmp/archive/Dockerfile');
    
});*/

/*program
.command('resource_promote <name>')
.description('Promote an owned resource from private scope to public.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true )
		harbormaster.promoteResource(name)
			.then(function(data){
				console.log(data);
		}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to promote a resource referenced by name myResource:');
    console.log('');
    console.log('  $ harbormaster resource_promote myResource');    
});*/

/*program
.command('resource_demote <name>')
.description('Demote an owned resource from public scope to private.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true )
		harbormaster.demoteResource(name)
			.then(function(data){
				console.log(data);
			}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to demote a resource referenced by name myResource:');
    console.log('');
    console.log('  $ harbormaster model_resource myResource');    
});*/

/*program
.command('resource_delete <name>')
.description('Delete a resource using its name or id.  Can only delete an owned private resource.')
.action(async function(name){
	var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
	if ( confirm.query == true )
		harbormaster.deleteResource(name)
			.then(function(data){
				console.log(data);
			}).catch(err => console.log(err));				
}).on('--help', function() {
    console.log('');
    console.log('Example to delete a resource referenced by name myResource:');
    console.log('');
    console.log('  $ harbormaster resource_delete my_resource_name');    
});*/

////////////////////////////////////////////////////
// system related options
////////////////////////////////////////////////////
program
.command('generate_system <yaml_file>')
.description('Generates a system using the directives of a System-as-Code YAML file.')
//.option('-x, --extended [value]', 'Show extended generation results.  Helpful for debugging. true/false default:false')
//.option('-g, --gitFile [value]', 'Git settings in YAML file, overrides appOptionsFile setting in the generation YAML file')
//.option('-o, --optionsFile [value]', 'System options in JSON file, overrides gitParams setting in the generation YAML file')
//.option('-m, --modelIdentifier [value]', 'Either a model file or the id of a previously used/registered model, overrides modelId setting in the generation YAML file')
.action(function(yaml_file/*, options*/){

	var gitFile = options.gitFile == undefined ? null : options.gitFile; 
	var optionsFile = options.optionsFile == undefined ? null : options.optionsFile;
	var modelIdentifier = options.modelIdentifier == undefined ? null : options.modelIdentifier;
	var extendedResults = options.extended == undefined ? "false" : options.extended;
	
	harbormaster.generateSystem(yaml_file, gitFile, optionsFile, modelIdentifier)
		.then(function(data){
			
			if ( extendedResults === "true" )
				console.log( "extendedMessage - " + data.extendedMessage );
			
			// regardless, rebuild without the 
			console.log("processingMessage: " + data.processingMessage);
			console.log("result: " + data.result);
			console.log("resultCode: " + data.resultCode);
			console.log("successes: " + data.success);
						  
	}).catch(err => console.log('err')); 
}).on('--help', function() {
    console.log('');
    console.log('');
    console.log('Example to generate an system using the directives of a YAML file:');
    console.log('');
    console.log('  $ harbormaster system_generate ./sample.yamls/genersystem.yml');
    console.log('');
});

/*program
.command('save_system <yaml_file> <system_name>')
.description('Saves a system as a System-as-Code YAML file.')
.action(function(yaml_file, system_name){
	harbormaster.saveSystem(yaml_file, system_name)
		.then(function(data){
			console.log(data);
	}).catch(err => console.log('err'));
}).on('--help', function() {
    console.log('');
    console.log('');
    console.log('Example to save an system via a System-as-Code YAML file:');
    console.log('');
    console.log('  $ harbormaster system_save ./sample.yamls/trading.system.system.as.code.yml');
    console.log('');
    console.log('');
});*/

/*program
.command('system_download <name> <output_file_path>')
.description('Download a system' )
.action(function(name, output_file_path){
console.log('function deprecated');

	harbormaster.downloadSystem(name, output_file_path)
		.then(function(data){
			console.log(data);
	}).catch(err => console.log(err));

}).on('--help', function() {
    console.log('');
    console.log('Example to download the system referred to by name mySystem:');
    console.log('');
    console.log('  $ harbormaster system_system_load mySystem ./tmp/archive/myapp.zip');
    
});*/

program
.command('delete_system <name>')
.description('Delete a previously created system.')
.action(async function(name){
	harbormaster.deleteSystem(name)
		.then(function(data){
			console.log(data);
	}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Example to delete a system:');
    console.log('');
    console.log('  $ harbormaster system_delete myFirstSystem');
});

/*program
.command('system_promote <name>')
.description('Promote an owned system from private scope to public.')
.action(async function(name){
	harbormaster.promoteSystem(name)
		.then(function(data){
			console.log(data);
	}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Promote an owned system from private scope to public.');
    console.log('');
    console.log('Example to promote the system referenced name mySystem:');
    console.log('');
    console.log('  $ harbormaster system__promote mySystem');    
});*/

/*program
.command('system_demote <name>')
.description('Demote an owned system from public scope to private.')
.action(async function(name){
	harbormaster.demoteSystem(name)
		.then(function(data){
			console.log(data);
	}).catch(err => console.log(err));
}).on('--help', function() {
    console.log('');
    console.log('Demote an owned system from public scope to private.');
    console.log('');
    console.log('Example to demote the system referenced by name mySystem:');
    console.log('');
    console.log('  $ harbormaster system_demote mySystem');
});*/

program
.command('list_systems')
.description('List previously created system.')
.option('-o, --output [type]', '[json] or pretty for pretty print')
.action(function(options){
	harbormaster.listSystem()
	.then(function(data) {
		var archives = JSON.parse(data.result);
		if ( options.output == constants.PRETTY_PRINT_OUTPUT) {
    		const table 		= new Table({
    									head: ['name', 'date-time', 'contributor', 'scope'], 
    									colWidths: [30, 30, 30, 20]
    								});
    		var saveParams;
    		var name;
    		for(var index = 0; index < archives.length; index++ ) {
    			//console.log(archives[index]);
    			name = JSON.parse(archives[index].saveParams).name;
    			if ( name === undefined )
    				name = "";
    			table.push( 
    						[
    							name, 
    							archives[index].dateTime,
    							archives[index].contributor,
    							archives[index].scopeType
    						] );
    		}
    		console.log(table.toString());
		}
		else {
    		console.log(archives);
		} 
		
	})
}).on('--help', function() {
    console.log('');
    console.log('Example to display all systems using pretty print:');
    console.log('');
    console.log('  $ harbormaster system_list --output pretty');
    console.log('');
});


////////////////////////////////////////////////////
// app archive related options
////////////////////////////////////////////////////


program
  .command('*')
  .action(function(env){
    console.log('no support for command "%s"', env);
  });
  
program.parse(process.argv);


// if no args (actually no second arg or more, output the help
if (!process.argv.slice(2).length) {
	program.outputHelp();
}

if (program.quiet == 'false' || program.quiet == undefined) {
	conf.set( constants.QUIET_MODE, false );
}
else {
	// set the global indicator to be quiet about output
	conf.set( constants.QUIET_MODE, true );
}
