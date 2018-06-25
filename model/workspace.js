const mongoose = require("mongoose"),
    Schema = mongoose.Schema

const model = "workspace"

let workspaceSchema = new Schema({
    name: String
})

let Workspace = mongoose.model(model, workspaceSchema)

module.exports = Workspace
