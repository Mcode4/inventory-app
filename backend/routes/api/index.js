const router = require('express').Router()

const userRouter = router.use('/users', require('./users'))
const folderRouter = router.use('/folders', require('./folders'))

module.exports = router