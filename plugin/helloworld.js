/*
This is an Insomnia plugin.

It adds a "Workspace action" button and a "response hook".
*/

console.log("[insomnia-playground/plugin] loaded")

module.exports.workspaceActions = [{
    label: 'Hello World',
    icon: 'fa-star',
    action: async (context, models) => {
        context.app.alert("Hello World!",
            "This message brought to you by the 'insomnia-playground' project. See https://github.com/dgroomes/insomnia-playground.")
    },
}];

module.exports.responseHooks = [async ctx => {
    const statusCode = ctx.response.getStatusCode();
    console.log(`Hello from a 'response hook'! The status code is: ${statusCode}. This message brought to you by the 'insomnia-playground' project. See https://github.com/dgroomes/insomnia-playground.`)
}];
