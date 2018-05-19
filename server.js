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
/* TODO: Comment each api functionality */

let dbConnected = false
const mongoDB_URL = "http://localhost:27017/d0"
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

app.use((req, resp, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
    res.setHeader("Access-Control-Allow-Credentials", true)
    next()
})

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

app.get("/d0/todos", (req, resp) => {
    let todos = getAllToDos()
    if (todos === null) {
        return resp.status(500).json({error: "Could not get all the todos"})
    }
    return resp.json(todos)
})

app.get("/d0/todo/:id", (req, resp) => {
    let todo = getToDo(req.path["id"])
    if (todo === null) {
        return resp.status(500).json({error: "Could not get the todo"})        
    }
    return resp.json(todo)
})

app.post("/d0/todo", (req, resp) => {
    let data = {
        title: req.body.title,
        text: req.body.text,
        dueDate: req.bosy.dueDate,
        done: false
    }

    let newTodo = new ToDo(data)
    newTodo.save((err, todo) => {
        if (err) {
            return resp.status(500).json({error: "Erro saving new todo"})
        }
        let errSave = false
        req.body.tasks.forEach(task => {
            if (errSave) {
                break
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

app.post("/d0/todo/:id/tasks", (req, resp) => {
    let tasks = req.params["tasks"]
    console.log("Tasks data: ", tasks)
    let errSave = false
    tasks.forEach(task => {
        if (errSave) {
            break
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

app.put("/d0/todo/:id/tasks/update", (req, resp) => {
    let tasksStatus = req.body.tasksStatus
    let errUpdate = false
    let todoID = req.path["id"]
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
            let flag = true
            tasks.forEach(task => {
                if (!task.done) {
                    flag = false
                    break
                }
            })
            if (flag) {
                ToDo.findOneAndUpdate({ObjectID(todoID)}, {done: true}, {new: true}, (err, todo) => {
                    return resp.json({success: "Tasks updated successfully", todo: todo})
                })
            }
        })
    }
})

// TODO: Delete task(s) of a todo

app.get("/d0/backlogs", (req, resp) => {
    Backlog.findAll((err, bLogs) => {
        if (err) {
            return resp.status(500).json({error: "Could not get backlogs"})
        }
        return resp.json(bLogs)
    })
})

app.post("/d0/backlog", (req, resp) => {
    let todo = getToDo(req.params["id"])
    if (todo === null) {
        return resp.status(500).json({error: "Could not get the todo to add it to backlog"})
    }
    let newBacklog = new Backlog({
        todo: todo
    })
    newBacklog.save((err, backlog) => {
        if (err) {
            return resp.status(500).json({error: "Error saving new backlog"})
        }
        return resp.json({success: "Created a backlog"})
    })
})

app.set("port", port)
app.listen(app.get("port"), () => {
    console.log("d0-api app now running on port " + port + "...")
})