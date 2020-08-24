// Interact with the Insomnia NeDB databases (there is a database for each of the types: Workspaces, Requests, Environments,
// etc.)

const INSOMNIA_APP_SUPPORT_FILEPATH = '/Users/davidgroomes/Library/Application Support/Insomnia';
const EXPORT_FORMAT = 4; // https://github.com/Kong/insomnia/blob/c3678d6e37a370a6632257e663ac3ec04f9eb04b/packages/insomnia-app/app/common/import.js#L19
const EXPORTER_VERSION = 1;

let NeDB = require('nedb');

/**
 * Load an Insomnia NeDB database
 * @param type the type of database (e.g. Request, Workspace, CookieJar)
 */
function loadInsomniaDatabase(type) {
    let filePath = `${INSOMNIA_APP_SUPPORT_FILEPATH}/insomnia.${type}.db`;
    let db = new NeDB({filename: filePath});
    console.log(`Loading the database ${db.filename}`)
    db.loadDatabase();
    return db;
}

let dbs = {
    workspaces: loadInsomniaDatabase('Workspace'),
    requests: loadInsomniaDatabase('Request'),
    folders: loadInsomniaDatabase('RequestGroup')
}

/**
 * the NeDB 'find' function but in a Promise
 * @param db
 * @param query
 * @return {Promise<Array<String>>}
 */
function findAsync(db, query = {}) {
    return new Promise((resolve, reject) => {
        db.find(query, (err, found) => {
            if (err) {
                console.warn(`"find" query failed on the ${db.filename} database`, err);
                reject(err);
                return;
            }
            resolve(found);
        });
    });
}

function prettyPrint(string) {
    let prettyJson = JSON.stringify(string, null, 2);
    console.log(prettyJson);
}

/**
 * Convenience function to execute a query and log the results. This is useful for development purposes.
 * @param db
 * @param query
 */
function findAndLog(db, query) {
    findAsync(db, query).then(found => console.log(prettyPrint(found)));
}


/**
 * Find all the items for a Workspace (specifically just the items of type RequestGroup(folder)/Request and the
 * Workspace itself. Finding items of type Environment and other types is NOT IMPLEMENTED.
 *
 * @param workspaceName
 * @return {Promise<void>}
 */
async function findWorkspaceItems(workspaceName = "Insomnia") {
    let foundWorkspaces = (await findAsync(dbs.workspaces, {name: workspaceName}));
    console.log(`Found ${foundWorkspaces.length} workspaces`)
    if (foundWorkspaces.length !== 1) {
        throw new Error(`Expected to find exactly 1 Workspace for the name '${workspaceName}' but found ${foundWorkspaces.length}`);
    }

    let workspace = foundWorkspaces[0];

    let unfolderedRequests = (await findAsync(dbs.requests, {parentId: workspace._id}));
    console.log(`Found ${unfolderedRequests.length} unfoldered requests (meaning, not in a folder!) in the workspace`);

    // Start an array of the items that will ultimately be exported (i.e. the folders and requests that are contained
    // in the workspace. This array initialization is the beginning of a long journey to explore potentially infinite
    // folders and sub-folders! The array starts with the 'unfoldered requests'.
    let exportItems = [workspace, ...unfolderedRequests];
    // Likewise, identify the first set of folders that must be explored.
    let foldersToExplore = (await findAsync(dbs.folders, {parentId: workspace._id}));
    console.log(`Found ${foldersToExplore.length} top-level folders in the workspace`);

    // The breadth-first search (BFS) across the folders and sub-folders.
    while (foldersToExplore.length > 0) {
        let folder = foldersToExplore.pop();
        console.log(`Exploring the folder ${folder.name}`)

        exportItems.push(folder);
        let subfolders = (await findAsync(dbs.folders, {parentId: folder._id}));
        console.log(`Found ${subfolders.length} subfolders`);
        foldersToExplore.push(...subfolders);

        let requests = (await findAsync(dbs.requests, {parentId: folder._id}));
        console.log(`Found ${requests.length} requests`);
        exportItems.push(...requests);
    }

    console.log(`Overall, found ${exportItems.length} items`);
    return exportItems;
}

/**
 * NOT YET FULLY IMPLEMENTED
 * Export an Insomnia Workspace to an array of JSON data (e.g. elements of type Workspace, RequestGroup (folders), and
 * Request).
 *
 * TODO. Save the extracted data to a file instead of just logging it to the console.
 */
async function exportWorkSpace() {
    let items = await findWorkspaceItems("Insomnia");
    return {
        _type: 'export',
        __export_format: EXPORT_FORMAT,
        __export_date: new Date(),
        __export_source: `dgroomes.insomnia.exporter:v${EXPORTER_VERSION}`,
        __notes: "This data was exported using https://github.com/dgroomes/nedb-playground",
        resources: items,
    };
}

exportWorkSpace().then(exportData => prettyPrint(exportData));