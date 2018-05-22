const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    ObjectID = require("mongodb").ObjectID

const model = "task"

let taskSchema = new Schema({
    name: String,
    todoID: {type: ObjectId},
    done: Boolean
})

taskSchema.statics.findToDoTasks = function (todoID, callback) {
    return this.find({todoID: ObjectID(todoID)}, callback);
}

let Task = mongoose.model(model, taskSchema)

module.exports = Task
