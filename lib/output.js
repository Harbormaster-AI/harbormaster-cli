const chalk         = require("chalk");
const Table   	    = require('cli-table')
const inquirer      = require("inquirer");

class output {

    static formatNumber(value, precision = 0) {
        return Number(value).toLocaleString('en-US', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        });
    }

    static outputVerification( title, verification ) {
        console.log();
        console.log();
        console.log(title);
        console.log('____________________________________________________________')
        output.outputField("Name", verification.name);
        output.outputField("Description", verification.description);
        output.outputField("Status", verification.status);
        output.outputField("Score", verification.score);
        console.log();
        if ( verification.progressions.length > 0 ) {
            console.log('GATES:');
            verification.progressions.forEach(p => {
                console.log(`  ${p.message.padEnd(60)} ${p.status}`);
            });
        }

    }

    static outputField(name, value) {
        console.log(name.padEnd(16) + value);
    }

    static async paginatedTable(options) {

        const pageSize  = options.pageSize || 20;
        const rows      = options.rows;
        let page        = 0;

        while (true) {

            console.clear();

            const table = new Table({
                head: options.headers,
                colWidths: options.colWidths
            });

            rows
                .slice(page * pageSize, (page + 1) * pageSize)
                .forEach(r => table.push(r));

            console.log(table.toString());

            console.log(
                `Page ${page + 1} of ${Math.ceil(rows.length / pageSize)}`
            );

            const choices = [];

            if (page > 0)
                choices.push("Previous");

            if ((page + 1) * pageSize < rows.length)
                choices.push("Next");
            else
                return; // nothing left to paginate, save the user from using quit

            choices.push("Quit");

            const answer = await inquirer.prompt([
                {
                    type: "list",
                    name: "action",
                    message: "Select:",
                    choices: choices
                }
            ]);

            switch (answer.action) {

                case "Next":
                    page++;
                    break;

                case "Previous":
                    page--;
                    break;

                default:
                    return;
            }
        }
    }

    static success(message) {
        console.log(chalk.green("✔ " + message));
    }

    static error(message) {
        console.log(chalk.red("✖ " + message));
    }

    static warning(message) {
        console.log(chalk.yellow("⚠ " + message));
    }

    static info(message) {
        console.log(chalk.cyan(message));
    }

    static json(obj) {
        console.log(JSON.stringify(obj, null, 4));
    }

    static outputConfiguration(inputs) {

        const groups = {};

        Object.keys(inputs).forEach(key => {

            const index = key.indexOf('.');

            if (index < 0) {
                groups["General"] = groups["General"] || {};
                groups["General"][key] = inputs[key];
                return;
            }

            const group = key.substring(0, index);
            const property = key.substring(index + 1);

            groups[group] = groups[group] || {};
            groups[group][property] = inputs[key];

        });

        Object.keys(groups)
            .sort()
            .forEach(group => {

                console.log();
                console.log(group.toUpperCase());
                console.log("-".repeat(group.length));

                Object.keys(groups[group])
                    .sort()
                    .forEach(property => {

                        console.log(
                            property.padEnd(30) +
                            groups[group][property]
                        );

                    });

            });

    }

    static outputVerification( verification ) {
        console.log('=============================');
        console.log( verification.name );
        console.log('=============================');
        console.log();
        console.log( verification.description );
        console.log();
        output.outputField('score', verification.score + '/100') ;
        output.outputField('status', verification.status);
        console.log();console.log();
        for(var index = 0; index < verification.progressions.length; index++ ) {
            output.outputProgression(verification.progressions[index]);
        }
        console.log();
    }

   static outputProgression( progression ) {
        const status = progression.score > 0 ? progression.status : '------';
        const score = progression.score > 0 ? progression.score : '--';

        console.log(progression.message.padEnd(100) + status.padEnd(16) + score);
   }
}


module.exports = output;