#!/usr/bin/env node

const chalk     		= require('chalk');
const clear   			= require('clear');
const figlet   			= require('figlet');
const harbormaster      = require('@system-as-code/sdk');
const inquirer			= require('../lib/inquire');
var constants 			= require("../lib/constants");
var output 			    = require("../lib/output");
const Configstore 		= require('configstore');
const conf 				= new Configstore(constants.HARBORMASTER);
const Table   			= require('cli-table')
const { version }       = require('../package.json');
const fs                = require("fs");
const path              = require("path");
const { Command }       = require('commander');


async function execute(argv) {

const program = new Command();
program.description('\nWelcome!! Familiar with Docker, Kubernetes, or Terraform?\n\nSystem-as-Code extends the concept as a declarative way to generate complete modern systems. Start by browsing the library of verified industry domain models and the catalog of SME authored blueprints');

const example = program
    .command('example')
    .description('Examples of System-as-Code yaml.  A great place to start when creating a system.');

example
.command('list')
.option('--output <format>', 'output format (pretty|json)')
.action(function(options, command) {

    const examples  = getAvailableExamples();
    const format    = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );

    if ( format === 'pretty' ) {
        examples.forEach((name, index) => {
            console.log(`${index + 1}. ${name}`);
        });
    }
    else {
        console.log(examples);
    }
});

example
.command('use <name>')
.action(function(name, options, command) {
    copyFileHere( name );
});

// -------------------------------------------------
// global configuration, some can be overridden
// at the command level
// -------------------------------------------------

const config = program
    .command('config')
    .description('Show and assign global configurations');

config
.command('set')
.description('Assign one or more global configuration parameters.')
.option('--aws <configFile>', 'Config file for AWS parameters to reuse across system generations')
.option('--git <configFile>', 'Config file for Git parameters to reuse across system generations')
.option('--docker <configFile>', 'Config file for Docker parameters to reuse across system generations')
.option('--platform <url>', 'Set the harbormaster platform endpoint. Default is platform.harbormaster.net.')
.option('--output <value>', 'Control the format of the output. Available at some command levels.')
.option('--quiet <value>', 'true/false To control if there should be output. Available some command levels.')
.action(function(options, command) {

    const platform      = command.opts().platform;
    const output        = command.opts().output;
    const quiet         = command.opts().quiet;

    if ( platform ) {
        conf.set("endpoint", platform );
    }

    if ( output ) {
        conf.set("output", output );
    }

    if ( quiet ) {
        conf.set("quiet",  quiet );
    }

})

config
.command('show')
.description('View the available global configurations.')
.action(function(options, command) {

        console.log();console.log();
        console.log( "_____________________________________________");
        console.log( "Global configuration settings")
        console.log();console.log();
        output.outputField( "platform url", conf.get("endpoint") );
        output.outputField( "output", conf.get("output") );
        output.outputField( "quiet", conf.get("quiet") );

});

// -------------------------------------------------
// Harbormaster CLI version
// -------------------------------------------------

program
.command('version')
.description('The version of this instance of this CLI to System-as-Code platform instance.')
.action(function() {
    console.log(version);
});

// -------------------------------------------------
// whoami - provide the user with system identity
// -------------------------------------------------

program
.command('whoami')
.description('You identity to Harbormaster.')
.action(function() {

    console.log();console.log();
    console.log( "_____________________________________________");
    console.log( "HM User Identity")
    console.log();console.log();

    if ( harbormaster.authenticated() == false ) {
        output.outputField( "Anonymous", '' )
        output.outputField( "Platform", harbormaster.endpoint() )
    }
    else {
        harbormaster.userInfo()
        			.then(function(result, err) {
        		if ( err )
        		    console.log( err )
        		else {
                    const user = result
                    output.outputField( 'Id', harbormaster.login );
                    output.outputField( 'Email', harbormaster.notification_email );
                    output.outputField( "Platform", harbormaster.endpoint() )
                }
            }).catch(err => console.log(err));
    }
});

// ------------------------------------------------
// logon to a HM instance
//
// for users of a server version, to co-ordinate
// efforts between the CLI and who they are there.
// ------------------------------------------------

program
.command('logon [token] [hostUrl]')
.description('Login if you have a token as a user of a Harbormaster instance.  Logging in is not necessary to use Harbormaster.' )
.action(async function(token, hostUrl){
	//console.log( chalk.white(
	//	    figlet.textSync('Harbormaster', { horizontalLayout: 'default', verticalLayout: "default" })
	//	)
	//);

	var theToken;
	if ( token != null ) {
		theToken = token;
	}
	else {
		var input = await inquirer.askCredentials();		// ask for the token and host Url
		theToken = input.tokenInput;
		if ( input.hostUrl != null && input.hostUrl != undefined && input.hostUrl.length != 0 )
			hostUrl = input.hostUrl;
		else
			hostUrl = 'http://localhost';
	}

	harbormaster.authenticate(theToken, hostUrl)
			.then(function(result,err) {
				console.log( 'Authorization complete.' );
			}).catch(err => console.log(err));
});


// ------------------------------------------------
// model commands
// ------------------------------------------------
const model = program
    .command('model')
    .description('List and discover a domain model to use for system generation.');

//------------------------------------------
//  model list with an option hint with
//  limiters for category and industry
//------------------------------------------

model
.command('list [hint] [category] [industry]')
.description('List available models. Use hint, category, and/or industry as filters.')
.option('--category <value>', 'limit by a category')
.option('--industry <value>', 'limit by an industry')
.option('--output <format>', 'output format (pretty|json)')
.option('--all', 'print all w/o pagination')
.option('--page [value], page size with a default of 20')
.option('--quiet', 'suppress output')
.action(async function(hint,category,industry, options, command){
    const filter = hint;
    category = category ?? 'all';
    industry = industry ?? 'all';

	harbormaster.listModels(filter, category, industry )
		.then(async function(data) {

			var models      = data;
			const format    = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );
            const quiet     = determineValue( command._optionValues.quiet, 'quiet', false );

            if( quiet === true ) {
                return;
            }

			if ( format === 'pretty') {
                const rows = [];
				for(var index = 0; index < models.length; index++ ) {
						rows.push(
								[
								        models[index].identity?.id ?? "<missing>",
									    models[index].identity?.name ?? "<missing>",
                                        models[index].metadata.category ?? "<missing>",
                                        models[index].metadata.industry ?? "<missing>",
                                        models[index].entities ?? "<missing>"
 								]);
				}

				await output.paginatedTable({
                    headers: ["Id", "Name", "Category", "Industry", "Entities"],
                    colWidths: [8, 35, 20, 25, 140],
                    rows: rows,
                    pageSize: command.all ? rows.length : command.page
                })
			}
			else if ( format === 'json') {
                console.log(JSON.stringify(models, null, 2));
			}
			else {
                console.error("Invalid output format. Use 'pretty' or 'json'.");
                process.exit(1);
			}
	}).catch(err => console.log(err));

});

//------------------------------------------
// model profile
//------------------------------------------

model
.command('profile <id>')
.description('Display details about a specific domain model.')
.option('--entities', 'Display entities.')
.option('--enums', 'Display enums.')
.option('--valueobjects', 'Display valueobjects')
.option('--verbose', 'Display full detail about the model.')
.option('--output <format>', 'Output format (pretty|json).')
.option('--quiet', 'Suppress output.')
.action(async function(id, options, command ){
	harbormaster.modelProfile(id)
		.then(async function(data) {

			var profile         = data?.loadedModel?.localModel;
            const entities      = command._optionValues.entities ?? false;
            const enums         = command._optionValues.enum ?? false;
            const valueobjects  = command._optionValues.valueobjects ?? false;
            const verbose       = command._optionValues.verbose ?? false;
            const debug         = command._optionValues.debug ?? false;
			const format        = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );
            const quiet         = determineValue( command._optionValues.quiet ?? 'false', 'quiet' );

            if( quiet === 'true' || quiet === true) {
                return;
            }

            if ( debug ) {
                console.log();
                console.log();
                console.log('____________________________________________________________')
                console.log('Harbormaster Internal Details');
                console.log('____________________________________________________________')
                output.outputField("checksum: ", profile.checksum );
                output.outputField("deleted: ", profile.deleted );
                output.outputField("ownerId: ", profile.ownerId );
                output.outputField("id: ", profile.id );
            }

            if ( format === 'pretty')  {
                console.log('____________________________________________________________')
                console.log('Domain Model Profile');
                console.log('____________________________________________________________')
                console.log();
                output.outputField("Name", profile.modelMetadata.name);
                output.outputField("Category", profile.modelMetadata.category);
                output.outputField("Industry", profile.modelMetadata.industry);
                output.outputField("Version", profile.modelMetadata.version);
                output.outputField("Status", profile.status);
                output.outputField("Last Updated", profile.lastUpdated);
                output.outputField("Type", profile.modelType);

                if ( entities || verbose ) {
                    console.log();
                    console.log();
                    console.log('Entities');
                    console.log('____________________________________________________________')
                    profile.entities
                        .split(",")
                        .sort()
                        .map(e => e.trim())
                        .forEach(e => console.log("  " + e));
                }

                if ( enums || verbose ) {
                    console.log();
                    console.log();
                    console.log('Enums');
                    console.log('____________________________________________________________')
                    profile.enums
                        .split(",")
                        .sort()
                        .map(e => e.trim())
                        .forEach(e => console.log("  " + e));
                }

                if ( valueobjects || verbose ) {
                    console.log();
                    console.log();
                    console.log('Value Objects');
                    console.log('____________________________________________________________')
                    profile.valueObjects
                        .split(",")
                        .sort()
                        .map(e => e.trim())
                        .forEach(e => console.log("  " + e));
                }
            }
            else
                console.log(profile);

	}).catch(err => console.log(err));
});

//------------------------------------------
// show list of model industries
//------------------------------------------

model
.command('industries')
.description('List all industries for the supported domain models.')
.option('--output <format>', 'Output format (pretty|json).' )
.action(async function(options, command){
	harbormaster.modelIndustries()
		.then(async function(data) {
		    var industries  = data;
			const format    = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );
            const quiet     = determineValue( command._optionValues.quiet ?? 'false', 'quiet' );

		    if ( format === 'pretty' ) {
                console.log(`Available Industries (${industries.length})\n`);

                industries.forEach((industry, index) => {
                    console.log(`${String(index + 1).padStart(2, ' ')}. ${industry}`);
                });
		    }
            else
                console.log(data);
	}).catch(err => console.log(err));

});


//------------------------------------------
// show list of model categories -
// for models that cross industries
//------------------------------------------
model
.command('categories')
.description('List all categories for supported domain models.')
.option('--output <format>', 'Output format (pretty|json).' )
.action(async function(options, command){
	harbormaster.modelCategories()
		.then(async function(data) {
		    var categories  = data;
			const format    = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );
            const quiet     = determineValue( command._optionValues.quiet ?? 'false', 'quiet' );

		    if ( format === 'pretty' ) {
                console.log(`Available Industries (${categories.length})\n`);

                categories.forEach((category, index) => {
                    console.log(`${String(index + 1).padStart(2, ' ')}. ${category}`);
                });
		    }
            else
                console.log(data);
	}).catch(err => console.log(err));

});

//------------------------------------------
// blueprint list - filter by a hint (keyword)
//------------------------------------------
const blueprint = program
    .command('blueprint')
    .description('Blueprint operations.');

blueprint
.command('list [hint]')
.description('List available blueprints.  User [hint] as a filter.')
.option('--category <value>', 'limit by a category.')
.option('--output <format>', 'Output format (pretty|json).')
//.option('--all', 'print all w/o pagination')
.option('--page [value], Page size with a default of 20.')
.option('--quiet', 'Suppress output.')
.action(async function(hint, options, command){
    const filter = hint;
    const category = command._optionValues.category ?? 'all';

	harbormaster.listBlueprints(hint, category)
	.then(async function(data) {
		var blueprints  = data;

        const format    = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );
        const quiet     = determineValue( command._optionValues.quiet, 'quiet', false );
        const page      = command._optionValues.page ?? 20
 //       const all      = command._optionValues.page ?? undefined

        if( quiet === true || quiet === 'true') {
            return;
        }

		if ( format === 'pretty') {
		    const rows = [];
			for(var index = 0; index < blueprints.length; index++ ) {
			    var techs = determineTechs( blueprints[index] );
				rows.push(
							[
								blueprints[index].identity.id,
								blueprints[index].identity.name,
								blueprints[index].version,
								blueprints[index].blueprintCategory ?? 'none',
								blueprints[index].publisher.identity.name + '[' + blueprints[index].publisher.company + ',' + blueprints[index].publisher.title + ']',
								techs,
								blueprints[index].certificationLevel,
								blueprints[index].designPattern,
							] );
			}
				await output.paginatedTable({
                    headers: ["Id", "Name", "Version", "Category", "Publisher", "Techs", "Cert Level", "Pattern"],
                    colWidths: [8, 30, 10, 20, 50, 30, 20, 30],
                    rows: rows,
                    pageSize: options.all ? rows.length : options.page
                })
		}
		else {
				console.log(JSON.stringify(blueprints, null, 2));
		}
	});
});

//------------------------------------------
// blueprint profile
//------------------------------------------

blueprint
.description('Show detail about a specific blueprint.')
.command('profile <id>')
.option('--verbose', 'Display full detail about the blueprint.')
.option('--output', 'Format for display. pretty|JSON.')
.option('--publisher', 'Output the publisher of the blueprint.')
.option('--blueprint_integrity', 'Output the blueprint integrity results.')
.option('--build_verify', 'Output the build verification results.')
.option('--runtime_verify', 'Output the runtime verification results.')
.option('--delivery_verify', 'Output the delivery verification results.')
.option('--verify', 'Output the entire verification results.')
.allowUnknownOption()
.action(async function(id, options, command){
	harbormaster.blueprintProfile(id)
		.then(async function(data) {
			var profile                 = data.blueprint;
            const debug                 = process.argv.includes("--debug");
            const format                = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );
            const verbose               = command._optionValues.verbose ?? false;
            const publisher             = command._optionValues.publisher ?? false;
            const blueprint_integrity   = command._optionValues.blueprint_integrity ?? false;
            const build_verify          = command._optionValues.build_verify ?? false;
            const runtime_verify        = command._optionValues.runtime_verify ?? false;
            const delivery_verify       = command._optionValues.delivery_verify ?? false;
            const verify                = determineValue( command._optionValues.verify, 'quiet', false );

            if ( debug ) {
                console.log();
                console.log();
                console.log('____________________________________________________________')
                console.log('Harbormaster Internal Details');
                console.log('____________________________________________________________')
                output.outputField("checksum: ", profile.checksum );
                output.outputField("cost: ", profile.cost );
                output.outputField("identity: ", profile.identity );
                output.outputField("id: ", profile.id );
            }

            if ( format === 'pretty' ) {
                console.log('____________________________________________________________')
                console.log('Blueprint Profile');
                console.log('____________________________________________________________')
                console.log();
                output.outputField("Name", profile.identity.name);
                output.outputField("Short Name", profile.shortName);
                output.outputField("Summary", profile.summary);
                output.outputField("Description", profile.description);
                output.outputField("Prime Vendor", profile.primaryVendor);
                output.outputField("Category", profile.blueprintCategory);
                output.outputField("Architecture", profile.architectureStyle);
                output.outputField("Design Pattern", profile.designPattern);
                output.outputField("Certification", profile.certificationLevel);
                output.outputField("Derived From", profile.derivedFrom);
                output.outputField("Release Status", profile.releaseStatus);

                if ( publisher || verbose || verify) {
                    console.log();
                    console.log();
                    console.log('____________________________________________________________')
                    console.log('Publisher');
                    console.log('____________________________________________________________')
                    console.log()
                    output.outputField("Name", profile.publisher.identity.name);
                    output.outputField("Title", profile.publisher.title);
                    output.outputField("Company", profile.publisher.company);
                    output.outputField("Bio", profile.publisher.bio);
                    console.log();
                    console.log('______')
                    console.log('Stats')
                    console.log('______')
                    output.outputField("# Blueprints", profile.publisher.stats.totalBlueprints);
                    output.outputField("# Systems", profile.publisher.stats.totalSystems);
                    output.outputField("# Generations", profile.publisher.stats.totalGenerations);

                }

                if ( blueprint_integrity || verbose || verify ) {
                    output.outputVerification( "Blueprint Integrity", profile.certification.blueprintVerification );
                }

                if ( build_verify || verbose || verify ) {
                    output.outputVerification( "Build Verification", profile.certification.buildVerification );
                }

                if ( runtime_verify || verbose || verify) {
                    output.outputVerification( "Runtime Verification", profile.certification.runtimeVerification );
                }

                if ( delivery_verify || verbose || verify) {
                    output.outputVerification( "Delivery Verification", profile.certification.deliveryVerification );
                }
            }
            else // assume JSON
                console.log(profile);

	}).catch(err => console.log(err));
});

//------------------------------------------
// blueprint input options
//------------------------------------------

blueprint
.command('inputs <id>')
.description('Available user input options, to include in a System-as-Code file to allow customization of a created system.')
.action(function(id){
	harbormaster.blueprintOptions(id)
		.then(function(data){
			//if ( program.quiet == 'true' )
				output.outputConfiguration(data.systemInputOptions)
			//else
			//	console.log(data);
	}).catch(err => console.log(err));
});

// -------------------------------------------------
// system commands
// -------------------------------------------------

const system = program
    .command('system')
    .description('System operations including generation.');

// -------------------------------------------------
// list of systems
// -------------------------------------------------

system
.command('list')
.description('List previously created systems. For authenticated users only.')
.option('--output <format>', 'Output format (pretty|json).')
.option('--page [value], Page size with a default of 20.')
.action(async function(options,command){

    if ( harbormaster.authenticated() == false ) {
        console.log('Feature is not available to anonymous users.')
        return;
    }

	harbormaster.listSystems()
	.then(async function(data) {
		var systems = data;

        const format    = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );
        const page      = command._optionValues.page ?? 20

		if ( format === 'pretty') {
            const rows = [];
    		for(var index = 0; index < systems.length; index++ ) {
    			rows.push(
    						[
    						    systems[index].identity.id,
    							systems[index].identity.name,
    							systems[index].description,
    							systems[index].blueprint.identity.name + '[' + systems[index].blueprint.certificationLevel + ']',
    							systems[index].model.identity.name + '[' + systems[index].model.category + (systems[index].model.modelVerification.status == 'PASSED' ? ', Certified' : '') + ']'
    						] );
    		}
            await output.paginatedTable({
                headers: ["Id", "Name", "Description", "Blueprint", "Model"],
                colWidths: [6, 30, 60, 30, 30],
                rows: rows,
                pageSize: options.all ? rows.length : options.page
            })

		}
		else {
    		console.log(systems);
		}

	})
});

//------------------------------------------
// generate system using System-as-Code file
//------------------------------------------

system
.command('generate <yaml_file>')
.description('Generates a system using the directives of a System-as-Code YAML file.')
.option('--quiet', 'Suppress output.')
//.option('-x, --extended [value]', 'Show extended generation results.  Helpful for debugging. true/false default:false')
//.option('-g, --gitFile [value]', 'Git settings in YAML file, overrides appOptionsFile setting in the generation YAML file')
//.option('-o, --optionsFile [value]', 'System options in JSON file, overrides gitParams setting in the generation YAML file')
//.option('-m, --modelIdentifier [value]', 'Either a model file or the id of a previously used/registered model, overrides modelId setting in the generation YAML file')
.action(function(yaml_file, options, command){

	//var gitFile = options.gitFile == undefined ? null : options.gitFile;
	//var optionsFile = options.optionsFile == undefined ? null : options.optionsFile;
	//var modelIdentifier = options.modelIdentifier == undefined ? null : options.modelIdentifier;
	//var extendedResults = options.extended == undefined ? "false" : options.extended;

    // clear the console/screen
    console.clear();

    new Promise(function(resolve, reject) {
        harbormaster.generateSystem(yaml_file)
            .then(function(data){

            const quiet     = determineValue( command._optionValues.quiet, 'quiet', false );

            if ( quiet === true || quiet === 'true' )
                return;

            var status = data;

            if ( status.success == false )
                console.log(status.errorMsgs);
            else {
                var buildSummary = data;
                console.log( "_____________________________________");
                console.log("System Generation Summary");
                console.log( "_____________________________________");
                console.log();
                Object.entries(buildSummary).forEach(([key, value]) => {
                    console.log(`    ${key.padEnd(20)} : ${value}`);
                });
            }

        }).catch(err => console.log(err));
    })
});


//------------------------------------------
// delete system - only available to
// non-anonymous users
//------------------------------------------

    system
        .command('certification <id>')
        .description('Checks the status of a system certification.')
        .option('--output <format>', 'Output format (pretty|json).')
        .option('--quiet', 'Suppress output.')
        .action(async function(id, options, command){

            harbormaster.checkSystemCertification(id)
                .then(function(data){

                    const quiet     = determineValue( command._optionValues.quiet, 'quiet', false );
                    const format    = determineValue( command._optionValues.output ?? undefined, 'output', 'json' );

                    if ( quiet === true || quiet === 'true' )
                        return;

                    const cert = data;

                    if ( format == 'pretty' ) {
                        console.log( '-------------------------------------------------')
                        console.log( 'System Certification Status')
                        console.log( '-------------------------------------------------')
                        console.log();console.log();
                        output.outputVerification( cert.projectVerification);
                        for(var index = 0; index < cert.verifications.length; index++ ) {
                            output.outputVerification(cert.verifications[index]);
                        }
                    }
                    else
                        console.log(cert);

                }).catch(err => console.log(err));
        });

//------------------------------------------
// delete system - only available to
// non-anonymous users
//------------------------------------------

    system
        .command('delete <id>')
        .description('Delete a previously created system.')
        .option('--quiet', 'Suppress output.')
        .action(async function(options, id){

            if ( harbormaster.authenticated() == false ) {
                console.log('Feature is not available to anonymous users.')
                return;
            }

            var confirm = await inquirer.confirmation(program.quiet);		// ask for confirmation;
            if ( confirm.query == true ) {
                harbormaster.deleteSystem(id)
                    .then(function(data){

                        const quiet     = determineValue( command._optionValues.quiet, 'quiet', false );

                        if ( quiet === true || quiet === 'true' )
                            return;

                        console.log(data);
                    }).catch(err => console.log(err));
            }
        });

program.parse(argv);

}

async function main() {
    return execute(process.argv);
}

module.exports = {
    main,
    execute
};

if (require.main === module) {
    main().catch(console.error);
}
// -------------------------------------------------
// build commands
// anonymous users need a certification id
// authenticated users a system id
// -------------------------------------------------

// if no args (actually no second arg or more, output the help
if (!process.argv.slice(2).length) {
//	program.outputHelp();
}


function getAvailableExamples() {
    const examplesDir = path.join(__dirname, "../examples/");

    return fs.readdirSync(examplesDir)
        .filter(file => file.endsWith(".yml"))
        .map(file => file.slice(0, -4))
        .sort();
}

function determineValue( inputValue, globalKey, defaultValue ) {

    if ( inputValue !== undefined )
        retVal = inputValue;
    else {
        const globalValue = conf.get(globalKey);

        if ( globalValue )
            retVal = globalValue;
        else
            retVal = defaultValue;
    }
    return ( retVal );
}

function copyFileHere( filename ) {
    const source = path.join(
        __dirname,
        "../examples",
        `${filename}.yml`
    );

    const destination = path.join(
        process.cwd(),
        `${filename}.yml`
    );

    try {

        if (!fs.existsSync(source)) {
            throw new Error(`Example '${filename}' does not exist.`);
        }

        if (fs.existsSync(destination)) {
            throw new Error(`'${filename}.yml' already exists in the current directory.`);
        }

        fs.copyFileSync(source, destination);

        console.log(`Created ${filename}.yml.  It is ready to be customized.`);

    } catch (err) {

        console.error(err.message);

    }
}

function determineTechs( blueprint ) {
const technologies = blueprint.techStack.techStackComponents
    .map(component => component.tech)
    .join(", ");

    return technologies;
}