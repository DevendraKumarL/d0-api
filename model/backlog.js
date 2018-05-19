const mongoose = require("mongoose"),
    Schema = mongoose.Schema,

const model = "backlog"

let backlogSchema = new Schema({
    todo: Any
})

backlogSchema.statics.findAll = function (callback) {
    return this.findAll(callback)
}

let Backlog = mongoose.model(model, backlogSchema)

module.exports = Backlog
