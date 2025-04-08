const router = require('express').Router()
const { setTokenCookie, restoreUser } = require("../../utils/auth")

const userRouter = router.use('/users', require('./users'))
const folderRouter = router.use('/folders', require('./folders'))
const fileRouter = router.use("/files", require("./file"))
const sessionRouter = router.use("/sessions", require("./sessions"))

module.exports = router