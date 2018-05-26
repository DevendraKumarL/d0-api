const express = require("express"),
    router = express.Router({mergeParams: true}),
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
        return resp.status(500).json({error: "DB connection error"})
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

/* Task */
// POST: Create new tasks under a todo having the todoID
router.post(API_URL + "todo/:id/tasks", Controller.createTasks)
// DELETE: Delete task(s) of a todo
router.delete(API_URL + "todo/:id/tasks", Controller.deleteTasks)

/* T0D0 */
// PUT: Update complete todo record along with task status, new tasks and backlog record
router.put(API_URL + "todo/:id/update", Controller.updateToDo)
// DELETE: Delete a todo completely and all its tasks including from backlog
router.delete(API_URL + "todo/:id", Controller.deleteToDo)

/* Backlog */
// GET: Return all the backlog records
router.get(API_URL + "backlogs", Controller.getBacklogs)
// POST: Add a todo(todoID) to backlog records
router.post(API_URL + "backlog", Controller.createBacklog)

module.exports  = router
