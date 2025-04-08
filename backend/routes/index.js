const express = require('express')
const router = express.Router()

router.use('/api', require('./api'))

if(process.env.NODE_ENV === "production"){
    const path = require("path")

    router.get("", (req, res)=>{
        res.cookie("XSRF-TOKEN", req.csrfToken())
        return res.sendFile(
            path.resolve(__dirname, "../../frontend", "dist", "index.html")
        )
    })

    router.use(express.static(path.resolve("../frontend", "dist")))

    router.get(/^(?!\/?api).*/, (req, res)=>{
        res.cookie("XSRF-TOKEN", req.csrfToken())
        return res.sendFile(
            path.resolve(__dirname, "../../frontend", "dist", "index.html")
        )
    })
}

if(process.env.NODE_ENV !== "production"){
    router.get("/api/csrf/restore", (req, res)=>{
        res.cookie("XSRF-TOKEN", req.csrfToken())
        return res.json({})
    })
}

router.get("/api/csrf/restore", (req, res)=>{
    res.cookie("XSRF_TOKEN", req.csrfToken())
    res.status(200).json({
        "XSRF-Token": req.csrfToken()
    })
})



module.exports = router