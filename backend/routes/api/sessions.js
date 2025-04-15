const router = require("express").Router()
const { Op, where } = require("sequelize")
const { User } = require("../../db/models")

const { setTokenCookie } = require("../../utils/auth")

router.get("", (req, res)=>{
    const { user } = req
    if(user){
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            countryCode: user.countryCode,
            phone: user.phone
        }
        return res.json({ user: safeUser })
    } else {
        return res.json({ user: null })
    }
})

router.post("", async(req, res)=>{
    let { credential, password } = req.body
    const errors = {}

    if(!credential) errors.credential = "Email or phone is required"
    if(!password) errors.password = "Password is required"

    if(Object.keys(errors).length > 0){
        return res.status(400).json({
            message: "Bad request",
            errors
        })
    }
    let user = null
    if(credential.includes("-")){
        credential = credential.split("-").join("")
    }
    if(Number(credential) === NaN){
        user = await User.unscoped().findOne({where:{phone: Number(credential)}})
    } else{
        user = await User.unscoped().findOne({where:{email: credential}})
    }
    
    if(!user){
        return res.status(401).json({
            message: "No user found"
        })
    } 
    else if(user.password !== password){
        return res.status(401).json({
            message: "Invalid password"
        })
    }
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        countryCode: user.countryCode,
        phone: user.phone
    }

    await setTokenCookie(res, safeUser)

    return res.json({ user: safeUser })
})

router.delete("", (_req, res)=>{
    res.clearCookie("token")
    return res.json({ message: "success" })
})

module.exports = router