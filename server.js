const express = require("express"),
    bodyParser = require("body-parser"),
    routes = require("./routes")

const app = express()
const port = 5001

app.use(bodyParser.json())

// Set Access Control headers to allow CORS
app.use((req, resp, next) => {
    resp.setHeader("Access-Control-Allow-Origin", "*")
    resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    resp.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
    resp.setHeader("Access-Control-Allow-Credentials", true)
    next()
})

// direct to the API routes
app.use("/", routes)

app.set("port", port)
app.listen(app.get("port"), () => {
    console.log("d0-api app now running on port " + port + "...")
})