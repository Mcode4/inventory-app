const router = require('express').Router()
const { User } = require('../../db/models')

router.post("/", async(req, res)=>{
    let {name, email, countryCode, phone, password} = req.body
    const errors = {}

    if(phone.includes('-')){
        phone = phone.split('-').join('')
    }
    if(!email.includes("@gmail.com")){
        res.status(500).json({
            message: "Invalid email",
            errors: "Must use a supported email"
        })
    }

    if(await User.findOne({where: {email}})){
        errors.email = "User with the email already exists"
    }
    if(await User.findOne({where: {countryCode, phone}})){
        errors.phone = "User with phone already exists"
    }
    if(Object.keys(errors).length > 0){
        res.status(500).json({
            message: "User already exists",
            errors
        })
    }

    if(!name) errors.name = "Name is required"
    else if(name.length < 3 || name.length > 25) errors.name = "Name must have 3-25 characters"

    if(!email) errors.email = "Email is required"
    else if(email.length < 256) errors.email = "Email must have 256 characters or less"

    if(!password) errors.password = "Password is required";
    if(phone && phone.length !== 10) errors.phone = "Phone number must have 10 digits"

    if(Object.keys(errors).length > 0){
        res.status(400).json({
            message: "Bad Request",
            errors
        })
    }

   const user = await User.create({ name, email, countryCode, phone, password })

   const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    countryCode: user.countryCode,
    phone: user.phone
   }

   res.status(201).json({
    user: safeUser
   })
})

module.exports = router