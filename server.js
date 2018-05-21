const express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    ToDo = require("./model/todo"),
    Task = require("./model/task"),
    Backlog = require("./model/backlog"),
    ObjectID = require("mongodb").ObjectID

const app = express()
const port = 5001

app.use(bodyParser.json())

/* TODO: Move this to a new file with routes */

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

// Set Access Control headers to allow CORS
app.use((req, resp, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
    res.setHeader("Access-Control-Allow-Credentials", true)
    next()
})

// Find and return the complete list of all todos along with all the tasks of each todo
function getAllToDos() {
    ToDo.findAll((err, todos) => {
        if (err) {
            return null
        }
        todos.forEach(todo => {
            Task.findToDoTasks(todo._id, (err, tasks) => {
                todo.tasks = tasks
            })
        })
        return todos
    })
}

// Find the return the complete todo data of a given todoID
function getToDo(todoID) {
    ToDo.findById(ObjectID(todoID), (err, todo) => {
        if (err) {
            return null
        }
        Task.findToDoTasks(todo._id, (err, tasks) => {
            todo.tasks = tasks
        })
        return resp.json(todo)
    })
}

// GET: Return all the todos along with all the tasks(complete detail record)
app.get("/d0/todos", (req, resp) => {
    let todos = getAllToDos()
    if (todos === null) {
        return resp.status(500).json({error: "Could not get all the todos"})
    }
    return resp.json(todos)
})

// GET: Return todo record for the given  todoID
app.get("/d0/todo/:id", (req, resp) => {
    let todo = getToDo(req.path["id"])
    if (todo === null) {
        return resp.status(500).json({error: "Could not get the todo"})        
    }
    return resp.json(todo)
})

// POST: Create a new todo along with all the data including tasks if any
app.post("/d0/todo", (req, resp) => {
    let data = {
        title: req.body.title,
        text: req.body.text,
        dueDate: req.bosy.dueDate,
        done: false
    }
    console.log("New ToDo data: ", data)

    let newTodo = new ToDo(data)
    newTodo.save((err, todo) => {
        if (err) {
            return resp.status(500).json({error: "Erro saving new todo"})
        }
        // Create new tasks for the given list of tasks in the request body for this new todo
        let tasks = req.body.tasks
        console.log("New Tasks data: ", tasks)
        let errSave = false
        tasks.forEach(task => {
            if (errSave) {
                return null
            }
            let tsk = new Task({
                name: task.name,
                todoID: todo._id,
                done: false
            })
            tsk.save((err, tsk) => {
                if (err) {
                    errSave = true
                    return resp.status(500).json({error: "Erro saving tasks for the new todo"})
                }
            })
        })
        if (!errSave) {
            return resp.json({success: "Created a todo and added task(s)? under it"})
        }
    })
})

// POST: Create new tasks under a todo having the todoID
app.post("/d0/todo/:id/tasks", (req, resp) => {
    let tasks = req.body.tasks
    console.log("New Tasks data: ", tasks)
    let errSave = false
    tasks.forEach(task => {
        if (errSave) {
            return null
        }
        let newTask = new Task({
            name: task.name,
            todoID: req.path["id"],
            done: false
        })
        newTask.save((err, tsk) => {
            if (err) {
                errSave = true
                return resp.status(500).json({error: "Error creating new tasks"})
            }
        })
    })
    if (!errSave) {
        return resp.json({success: "Created " + tasks.length + " new tasks"})
    }
})

// PUT: Update complete todo record along with task status and backlog record
app.put("/d0/todo/:id/update", (req, resp) => {
    let tasksStatus = req.body.tasksStatus
    console.log("Tasks Status: ", tasksStatus)
    let errUpdate = false
    let todoID = req.path["id"]
    // For each task update its status done:true/false
    tasksStatus.forEach(tskStatus => {
        let newStatus = {done: tskStatus.done}
        let filter = {_id: ObjectID(tskStatus.id), todoID: ObjectID(todoID)}
        Task.findOneAndUpdate(filter, newStatus, (err, tsk) => {
            if (err) {
                errUpdate = true
                return resp.status(500).json({error: "Error updating the tasks"})
            }
        })
    })
    if (!errUpdate) {
        // Check if all the tasks are done
        Task.findToDoTasks(todoID, (err, tasks) => {
            if (err) {
                return resp.status(500).json({error: "Error getting all tasks of this todo"})
            }
            // Find if any task is not yet done under this todo
            let flag = true
            tasks.forEach(task => {
                if (!task.done) {
                    flag = false
                    return null
                }
            })
            let todoUpdatedData = {
                title: req.body.title,
                text: req.body.text,
                dueDate: req.body.dueDate,
                done: flag
            }
            console.log("todoUpdatedData: ", todoUpdatedData)
            // Update complete todo record
            ToDo.findOneAndUpdate({_id: ObjectID(todoID)}, todoUpdatedData, {new: true}, (err, todo) => {
                if (err) {
                    return resp.status(500).json({error: "Error updating the todo"})
                }
                // If the todo is marked done, remove it from backlog if present in it
                if (flag) {
                    Backlog.findByIdAndRemove(todo._id, (err, res) => {
                        return resp.json({success: "Todo, Tasks and Backlogs updated successfully", todo: todo})
                    })
                }
                return resp.json({success: "Todo and Tasks updated successfully", todo: todo})
            })
        })
    }
})

// DELETE: Delete task(s) of a todo
app.delete("/d0/todo/:id/tasks", (req, resp) => {
    let tasksToDelete = req.body.deleteTasks
    console.log("Tasks to delete: ", tasksToDelete)
    let errDelete = false
    tasksToDelete.forEach(tsk => {
        if (errUpdate) {
            return null
        }
        let filter = {_id: ObjectID(tsk.id), todoID: ObjectID(req.path["id"])}
        Task.findOneAndRemove(filter, (err, res) => {
            if (err) {
                return resp.status(500).json({error: "Error deleting the tasks"})
            }
        })
    })
    if (!errDelete) {
        return resp.json({success: "Deleted the tasks successfully"})
    }
})

// GET: Return all the backlog records
app.get("/d0/backlogs", (req, resp) => {
    Backlog.findAll((err, bLogs) => {
        if (err) {
            return resp.status(500).json({error: "Could not get backlogs"})
        }
        return resp.json(bLogs)
    })
})

// POST: Add a todo(todoID) to backlog records
app.post("/d0/backlog", (req, resp) => {
    let newBacklog = new Backlog({
        todoID: req.body.id
    })
    newBacklog.save((err, backlog) => {
        if (err) {
            return resp.status(500).json({error: "Error saving new backlog"})
        }
        return resp.json({success: "Created a backlog with given todoID"})
    })
})

app.set("port", port)
app.listen(app.get("port"), () => {
    console.log("d0-api app now running on port " + port + "...")
})