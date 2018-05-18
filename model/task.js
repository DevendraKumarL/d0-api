const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectID = require("mongodb").ObjectID

const model = "task"

let taskSchema = new Schema({
    name: String,
    todoID: ObjectID,
    done: Boolean
})

taskSchema.statics.findToDoTasks = function (todoID, callback) {
    return this.findAll({todoID: ObjectID(todoID)}, callback);
}

let Task = mongoose.model(model, taskSchema)

module.exports = Task
