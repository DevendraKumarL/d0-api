const mongoose = require("mongoose"),
	Schema = mongoose.Schema

const model = "todo"

let todoSchema = new Schema({
	title: String,
	text: String,
	dueDate: Date,
	tasks: Array,
	done: Boolean
})

let ToDo = mongoose.model(model, todoSchema)

module.exports = ToDo;
