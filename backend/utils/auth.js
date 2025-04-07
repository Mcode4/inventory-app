const jwt = require("jsonwebtoken")
const { jwtConfig } = require("../config")
const { User } = require("../db/models")

const { secret, expiresIn } = jwtConfig

const setTokenCookie = (res, user)=>{
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        countryCode: user.countryCode,
        phone: user.phone
    }
    const token = jwt.sign(
        { data: safeUser },
        secret,
        { expiresIn: parseInt(expiresIn) }
    )

    const isProduction = process.env.NODE_ENV === "production"

    res.cookie("token", token, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    })

    return token
}

const restoreUser = (req, res, next)=>{
    const { token } = req.cookies
    req.user = null

    return jwt.verify(token, secret, null, async (err, jwtPayload)=>{
        if(err){
            return next()
        }

        try{
            const { id } = jwtPayload.data
            req.user = await User.findByPk(id, {
                attributes: {
                    include: ["email", "createdAt", "updatedAt"]
                }
            })
        } catch(error){
            res.clearCookie("token")
            return next()
        }

        if(!req.user) res.clearCookie("token")
        return next()
    })
}

const requireAuth = (req, res, next)=>{
    if(req.user) return next()
    
    const err = new Error("Authenication required")
    err.title = "Authenication required"
    err.errors = { message: "authenication required" }
    err.status = 401
    return next(err)
}

module.exports = { setTokenCookie, restoreUser, requireAuth}