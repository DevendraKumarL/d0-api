const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId
    ObjectID = require("mongodb").ObjectID

const model = "backlog"

let backlogSchema = new Schema({
    todoID: {type: ObjectId}
})

backlogSchema.statics.findAll = function (callback) {
    return this.findAll(callback)
}

let Backlog = mongoose.model(model, backlogSchema)

module.exports = Backlog
