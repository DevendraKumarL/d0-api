const express = require("express"),
    bodyParser = require("body-parser"),
    ToDo = require("./model/todo"),
    Task = require("./model/task"),
    Backlog = require("./model/backlog"),
    ObjectID = require("mongodb").ObjectID

const app = express()
const port = 5001

app.use(bodyParser.json())

function getAllToDos() {
    ToDo.findAll((err, todos) => {
        if (err) {
            return null
        }
        todos.forEach(todo => {
            todo.tasks = Task.findToDoTasks(todo._id)
        })
        return todos
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
    ToDo.findById(ObjectID(req.params["id"]), (err, todo) => {
        if (err) {
            return resp.status(500).json({error: "Could not get the todo"})
        }
        todo.tasks = Task.findToDoTasks(todo._id)
        return resp.json(todo)
    })
})

app.get("/d0/backlogs", (req, resp) => {
    Backlog.findAll((err, bLogs) => {
        if (err) {
            return resp.status(500).json({error: "Could not get backlogs"})
        }
        return resp.json(bLogs)
    })
})

app.set("port", port)
app.listen(app.get("port"), () => {
    console.log("d0-api app now running on port " + port + "...")
})