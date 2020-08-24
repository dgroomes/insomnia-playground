// Interact with the Insomnia NeDB databases (there is a database for each of the types: Workspaces, Requests, Environments,
// etc.)

const REQUESTS_DB_FILEPATH = '/Users/davidgroomes/Library/Application Support/Insomnia/insomnia.Request.db';
const EXPORT_FORMAT = 4; // https://github.com/Kong/insomnia/blob/c3678d6e37a370a6632257e663ac3ec04f9eb04b/packages/insomnia-app/app/common/import.js#L19
const EXPORTER_VERSION = 1;

let NeDB = require('nedb');
let requestsDb = new NeDB({
    filename: REQUESTS_DB_FILEPATH
});
console.log(`Loading the database ${requestsDb.filename}`)
requestsDb.loadDatabase();

let data = {
    _type: 'export',
    __export_format: EXPORT_FORMAT,
    __export_date: new Date(),
    __export_source: `dgroomes.insomnia.exporter:v${EXPORTER_VERSION}`,
    __notes: "This data was exported using https://github.com/dgroomes/nedb-playground",
    resources: [],
};

/**
 * the NeDB 'find' function but in a Promise
 * @param db
 * @param query
 * @return {Promise<Array<String>>}
 */
function findAsync(db, query = {}) {
    return new Promise(resolve => {
        db.find(query, (err, found) => {
            if (err) {
                console.warn(`"find" query failed on the ${db.filename} database`, err);
                resolve([]);
                return;
            }
            resolve(found);
        });
    });
}


async function findRequests() {
    let found = (await findAsync(requestsDb, {}));
    console.log(`Found ${found.length} Request elements`);
}

findRequests();