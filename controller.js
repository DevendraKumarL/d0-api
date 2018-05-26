const ToDo = require("./model/todo"),
    Backlog = require("./model/backlog"),
    ObjectID = require("mongodb").ObjectID

module.exports = {
    // GET: Return all the todos along with all the tasks(complete detail record)
    getAllToDos: (req, resp) => {
        // Find and return the complete list of all todos along with all the tasks of each todo
        ToDo.find((err, todos) => {
            if (err) {
                return resp.status(500).json({error: "Could not get all the todos"})
            }
            return resp.json(todos)
        })
    },

    // GET: Return todo record for the given  todoID
    getToDo: (req, resp) => {
        // Find the return the complete todo data of a given todoID
        ToDo.findById(ObjectID(req.params["id"]), (err, todo) => {
            if (err) {
                return resp.status(500).json({error: "Could not get the todo"})        
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
            tasks: req.body.tasks
        }
    
        let newTodo = new ToDo(data)
        newTodo.save((err, todo) => {
            if (err) {
                return resp.status(500).json({error: "Error creating a new todo"})
            }
            return resp.json({success: "Created a todo and added tasks under it", todo: todo})
        })
    },


    // POST: Create new tasks under a todo having the todoID
    createTasks: (req, resp) => {
        let tasks = req.body.tasks
        // TODO: add new items to tasks array using mongoose
        return resp.json({success: "Created " + tasks.length + " new tasks", tasks: tasks})
    },

    // DELETE: Delete task(s) of a todo
    deleteTasks: (req, resp) => {
        let tasksToDelete = req.body.deleteTasks
        // TODO: delete tasks from array using mongoose
        return resp.json({success: "Deleted the tasks successfully"})
    },

    
    // PUT: Update complete todo record along with task status, new tasks and backlog record
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
        if (flag) {
            updatedToDo.done = true
        }
        // TODO: Check if mongoose update works by updating the complete object or only the supplied fields
        ToDo.findOneAndUpdate({_id: ObjectID(todoID)}, updatedToDo, {new: true}, (err, todo) => {
            if (err) {
                return resp.status(500).json({error: "Error updating the todo"})
            }
            // If the todo is marked done, remove it from backlog
            if (flag) {
                Backlog.findByIdAndRemove(todo._id, (err, res) => {
                    if (err) {
                        return resp.status(500).json({error: "Error removing the todo from backlog"})
                    }
                    return resp.json({success: "Todo, Tasks and Backlogs updated successfully", todo: todo})
                })
            }
            else {
                return resp.json({success: "Todo and Tasks updated successfully", todo: todo})
            }
        })
    },

    // DELETE: Delete a todo completely and all its tasks including from backlog
    deleteToDo: (req, resp) => {
        let todoID = req.params["id"]
        let filter = {todoID: ObjectID(todoID)}
        // 1. Delete the todo from backlog
        Backlog.findOneAndRemove(filter, (err, bcl) => {
            if (err) {
                return resp.status(500).json({error: "Could not remove the todo from backlog"})
            }
            // 2. Delete the main todo
            ToDo.findOneAndRemove({_id: ObjectID(todoID)}, (err, tdo) => {
                if (err) {
                    return resp.status(500).json({error: "Could not delete the todo"})
                }
                return resp.json({success: "Deleted the todo sucessfully"})
            })
        })        
    },


    // GET: Return all the backlog records
    getBacklogs: (req, resp) => {
        Backlog.find((err, bLogs) => {
            if (err) {
                return resp.status(500).json({error: "Could not get backlogs"})
            }
            return resp.json(bLogs)
        })
    },

    // POST: Add a todoID to backlog records
    createBacklog: (req, resp) => {
        let newBacklog = new Backlog({
            todoID: req.body.id
        })
        newBacklog.save((err, backlog) => {
            if (err) {
                return resp.status(500).json({error: "Error saving new backlog"})
            }
            return resp.json({success: "Created a backlog with given todoID"})
        })
    }
}
