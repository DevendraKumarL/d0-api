const express = require("express"),
	router = express.Router({ mergeParams: true }),
	Controller = require("./controller"),
	mongoose = require("mongoose")

const API_URL = "/d0/"

let dbConnected = false
const mongoDB_URL = "mongodb://localhost:27017/d0"
mongoose.connect(mongoDB_URL)

let db = mongoose.connection
db.on("error", (error) => {
	console.error.bind(error, "MongoDB Connection Error")
	dbConnected = false
})
db.on("open", () => {
	console.log("MongoDB Connection successful")
	dbConnected = true
})

router.use(API_URL, (req, resp, next) => {
	if (!dbConnected) {
		return resp.status(500).json({ error: "DB connection error" })
	}
	next()
})

/* T0D0 */
// GET: Return all the todos along with all the tasks(complete detail record)
router.get(API_URL + "todos", Controller.getAllToDos)

// GET: Return todo record for the given  todoID
router.get(API_URL + "todo/:id", Controller.getToDo)

// POST: Create a new todo along with all the data including tasks if any
router.post(API_URL + "todo", Controller.createToDo)

// PUT: Update the complete todo record along with task status, new tasks
router.put(API_URL + "todo/:id/update", Controller.updateToDo)

// DELETE: Delete a todo completely
router.delete(API_URL + "todo/:id", Controller.deleteToDo)

// PUT: Update a todo to mark it has "done"
router.put(API_URL + "todo/:id", Controller.updateDoneStatus)


/* Workspace */
// GET: get lists of all the workspaces from DB
router.get(API_URL + "workspaces", Controller.getAllWorkspaces)

// POST: create a new workspace with given name
router.post(API_URL + "workspace", Controller.createWorkspace)

module.exports = router
