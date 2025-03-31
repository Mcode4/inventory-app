const express = require('express');
const app = express()

//.env variables
require('dotenv').config()


//middleware
app.use(express.json())


//routes
const routes = require('./routes')
app.use(routes)



//port
const port = process.env.PORT || 8000
app.listen(port, console.log(`Server listening on port ${port}...`))

module.exports = app