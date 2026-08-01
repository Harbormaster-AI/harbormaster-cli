# System-as-Code CLI

---

### Usage: hm [options] [command]

**Options**:

-h, --help               `display help for command`

**Commands**:

example                  `Examples of System-as-Code yaml.  A great place to start when creating a system.`

config                   `Show and assign global configurations`

version                  `The version of this instance of this CLI to System-as-Code platform instance.`

whoami                   `You identity to Harbormaster.`

logon [token] [hostUrl]  `Login if you have a token as a user of a Harbormaster instance.  Logging in is not necessary to use Harbormaster.`

model                    `List and discover a domain model to use for System-as-Code.`

blueprint                `Show detail about a specific blueprint.`

system                   `System operations, most important is generation.`

help [command]           'display help for command'

---

### Usage: hm example [options] [command]

>Examples of System-as-Code yaml.  A great place to start when creating a system.

**Options**:

-h, --help      `display help for command`

**Commands**:

list [options]

use <name>

help [command]  `Display help for command.`

---

### Usage: hm config [options] [command]

>Show and assign global configurations.  Use to apply a default setting across all commands.

**Options**:  

-h, --help      `display help for command`

**Commands**:  

set [options]   `Assign one or more global configuration parameters.`  

show            `View the available global configurations.`  

help [command]  `Display help for command.`  

---

### Usage: hm logon [options] [token] [hostUrl]  

>Logging in is not necessary. If you have a token as a user of a Harbormaster instance provide here.  The system will persist your activity.

Options:
-h, --help  `display help for command`

---

### Usage: hm model [options] [command]  

> List and discover a domain model to use for a generation session. 

**Options**:  
-h, --help                                   `display help for command`

**Commands**:  

list [options] [hint] [category] [industry]  `List available models. Use hint, category, and/or industry as filters.`    

profile [options] <id>                       `Display details about a specific domain model.`    

industries [options]                         `List all industries for the supported domain models.`    

categories [options]                         `List all categories for supported domain models.`    

help [command]                               `Display help for command`

---

### Usage: hm blueprint [options] [command]  

>Show detail about a specific blueprint.

***Options***:  

-h, --help              `Display help for command.`  

***Commands***:  

list [options] [hint]   `List available blueprints.  User [hint] as a filter.`    

profile [options] <id>  `Display details about a specific domain model.`  

inputs <id>             `Available user input options, to include in a System-as-Code file to allow customization of a created system.`  

help [command]          `Display help for command.`    


---

## Usage: hm system [options] [command]  

System operations.  

**Options**:  

-h, --help                      `Display help for command.`  

**Commands**:  

list [options]                  `List previously created systems. For authenticated users only.`  

generate [options] <yaml_file>  `Generates a system using the directives of a System-as-Code YAML file.`  

certification [options] <id>    `Checks the status of a system certification.`

delete [options] <id>           `Delete a previously created system. For authenticated users only.`


---

## Usage: hm system generate [options] <yaml_file>  


Generates a system using the directives of a System-as-Code YAML file.  Available inputs will override yaml file settings.

**Options**:  

--application_name <name>                `Name to use for the generated system.`  

--application_description <description>  `Description to use for the generated system.`  

--blueprint_name <name>                  `Blueprint to use during system generation.`  

--model_name <name>                      `Domain model to use during system generation.`   
--git_repository <repository>            `Git repository to commit all system files to.`  
--git_token <token>                      `Git token to use for commit.`  
--docker_repository <repository>         `Docker repository to push the built image to.`  
--docker_password <password>             `Password to access designated Docker host.`  
--quiet                                  `Suppress output.`  
-h, --help                               `Display help for command.`  
