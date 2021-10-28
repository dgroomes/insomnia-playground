console.log("[insomnia-playground/plugin] loaded")

module.exports.workspaceActions = [{
    label: 'Hello World',
    icon: 'fa-star',
    action: async (context, models) => {
        context.app.alert("Hello World!",
            "This message brought to you by the 'insomnia-playground' project. See https://github.com/dgroomes/insomnia-playground.")
    },
}];
