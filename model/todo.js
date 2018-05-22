const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectID = require("mongodb").ObjectID

const model = "todo"

let todoSchema = new Schema({
    title: String,
    text: String,
    dueDate: Date,
    done: Boolean
})

todoSchema.statics.findAll = function (callback) {
    return this.find(callback)
}

let ToDo = mongoose.model(model, todoSchema)

module.exports = ToDo;
