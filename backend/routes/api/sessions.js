const router = require("express").Router()
const { Op } = require("sequelize")
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
    const { credential, password } = req.body
    const errors = {}

    if(!credentails) errors.credentials = "Email or username is required"
    if(!password) errors.password = "Password is required"

    if(Object.keys(errors).length > 0){
        return res.status(400).json({
            message: "Bad request",
            errors
        })
    }

    const user = await User.unscoped().findOne({
        where: {
            [Op.or]: {
                email: credential,
                phone: credential
            },
            password: password
        }
    })

    if(!user){
        res.status(401).json({
            message: "Invalid credentials"
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

router.delete("", (req, res)=>{
    res.clearCookie("token")
    return res.json({ message: "success" })
})

module.exports = router