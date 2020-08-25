# nedb-playground

Learning and exploring the lightweight (kind of like SQLite) JavaScript database *NeDB* (<https://github.com/louischatriot/nedb>).

### Instructions

To use this script, install the dependencies with `npm install`. Then execute the script with `node insomnia.js`.

### Background

I want to use NeDB to extract [Insomnia REST Client](https://github.com/Kong/insomnia) request data. In other words, I 
want to implement a *Commandline export* feature similar to what is requested in the GitHub issue 
[[Feature Request] Command line API (import/export, send request) #479](https://github.com/Kong/insomnia/issues/479) in
the Insomnia GitHub project.

### Exploratory Notes

Install the NeDB NPM module in the local project with `npm install --save nedb`.

Start a Node REPL session with `node`.

In the Node REPL, load `nedb` with `var Datastore = require('nedb');`.

Create a new database with `var db = new Datastore()`.

Explore the functions of an NeDB database by typing `db.` and then pressing `Tab` **two times** to engage the REPL's
autocompletion! Putting it all together, you should something like this:

![NeDB getting started in the Node.js REPL screenshot](nedb-getting-started.png)

### `example-export-files/`

Do you want an example? There are example data files exported from my own Insomnia workspaces. There is both:

* A file exported using the Insomnia application: `Insomnia_2020-08-24.json`
* A file exported using this project: `Insomnia-Insomnia_2020-08-24.json`

You can compare these two files to see that this project exports similar data as the Insomnia app. In theory you could 
use a diffing tool to easily compare and contrast the differences but there are too many noisy differences that make the
diff hard to read:
* The order of the elements in the `resources` JSON array is different between the two files
* The order of the JSON fields is differnet between the two files
* The file exported by this project supports only 'workspace', 'requests', and 'request groups' but not 'environment' or 'cook jar'.  
 
To clean up the differences so that you can effectively use a diffing tool you can pass the files through a `jq` filter
like this:

```
cat example-export-files/InsomniaAppExport.json |\
  jq --sort-keys '.resources 
  |= sort_by(._id)
  | (.resources |= map(select(._type == "workspace" or ._type == "request" or ._type == "request_group")))' \
  > example-export-files/InsomniaAppExport.formatted.json
```

```
cat example-export-files/NedbPlaygroundExport.json |\
  jq --sort-keys  '.resources
  |= sort_by(._id)' \
  > example-export-files/NedbPlaygroundExport.formatted.json
```

`diff example-export-files/InsomniaAppExport.formatted.json example-export-files/NedbPlaygroundExport.formatted.json`