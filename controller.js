const ToDo = require("./model/todo"),
	Workspace = require("./model/workspace"),
	ObjectID = require("mongodb").ObjectID

module.exports = {
	// GET: Return all the todos along with all the tasks(complete detail record)
	getAllToDos: (req, resp) => {
		// Find and return the complete list of all todos along with all the tasks of each todo
		ToDo.find((err, todos) => {
			if (err) {
				return resp.status(500).json({ error: "Could not get all the todos" })
			}
			return resp.json(todos)
		})
	},

	// GET: Return todo record for the given  todoID
	getToDo: (req, resp) => {
		// Find the return the complete todo data of a given todoID
		ToDo.findById(ObjectID(req.params["id"]), (err, todo) => {
			if (err) {
				return resp.status(500).json({ error: "Could not get the todo" })
			}
			return resp.json(todo)
		})
	},

	// POST: Create a new todo along with all the data including tasks
	createToDo: (req, resp) => {
		let data = {
			title: req.body.title,
			text: req.body.text,
			dueDate: req.body.dueDate,
			done: false,
			tasks: req.body.tasks,
			workspace: req.body.workspace
		}

		let newTodo = new ToDo(data)
		newTodo.save((err, todo) => {
			if (err) {
				return resp.status(500).json({ error: "Error creating a new todo" })
			}
			return resp.json({ success: "Created a todo and added tasks under it", todo: todo })
		})
	},

	// PUT: Update the complete todo record along with task status, new tasks
	updateToDo: (req, resp) => {
		let todoID = req.params["id"]
		let updatedToDo = req.body.updatedToDo
		updatedToDo.done = false
		let flag = true, tasks = updatedToDo.tasks
		for (let i = 0; i < tasks.length; ++i) {
			if (!tasks[i].done) {
				flag = false
				break
			}
		}
		// flag must be true and tasks cannot be empty
		if (flag && tasks.length > 0) {
			updatedToDo.done = true
		}
		let filter = { _id: ObjectID(todoID) }
		ToDo.findOneAndUpdate(filter, updatedToDo, { new: true }, (err, todo) => {
			if (err) {
				return resp.status(500).json({ error: "Error updating the todo" })
			}
			return resp.json({ success: "Todo and Tasks updated successfully", todo: todo })
		})
	},

	// DELETE: Delete a todo completely and all its tasks
	deleteToDo: (req, resp) => {
		let todoID = req.params["id"]
		let filter = { todoID: ObjectID(todoID) }
		ToDo.findOneAndRemove({ _id: ObjectID(todoID) }, (err, tdo) => {
			if (err) {
				return resp.status(500).json({ error: "Could not delete the todo" })
			}
			return resp.json({ success: "Deleted the todo sucessfully" })
		})
	},

	// PUT: Update a todo to update "done" property
	updateDoneStatus: (req, resp) => {
		let filter = { _id: ObjectID(req.params["id"]) }
		let done = { done: req.body.done }
		ToDo.findOneAndUpdate(filter, done, { new: true }, (err, todo) => {
			if (err) {
				return resp.status(500).json({ error: "Error updating the todo" })
			}
			return resp.json({ success: "Updated the todo successfully", todo: todo })
		})
	},

	// GET: get lists of all the workspaces from DB
	getAllWorkspaces: (req, resp) => {
		Workspace.find((err, workspaces) => {
			if (err) {
				return resp.status(500).json({ error: "Error fetching workspaces" })
			}
			return resp.json(workspaces)
		})
	},

	// POST: create a new workspace with given name
	createWorkspace: (req, resp) => {
		Workspace.findOne({ name: req.body.name }, (err, ws) => {
			if (err) {
				return resp.status(500).json({ error: "Error checking existing workspaces" })
			}
			if (!ws) {
				let workspace = new Workspace({
					name: req.body.name
				})
				workspace.save((err, workspace) => {
					if (err) {
						return resp.status(500).json({ error: "Error creating a new workspace" })
					}
					return resp.json({ success: "Successfully created a new workspace", workspace: workspace })
				})
			}
			else {
				return resp.status(400).json({error: "Workspace already exists"});
			}
		})
	}
}
