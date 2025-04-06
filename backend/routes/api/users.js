const router = require('express').Router()
const e = require('express')
const { User } = require('../../db/models')
// Country Code for Phone Numbers not in use yet



// Create a new user
router.post("", async(req, res)=>{
    let {name, email, countryCode, phone, password} = req.body
    const errors = {}

    console.log("REQUEST", req, "\n \n BODY: ", req.body)
    if(!req.body){
        return res.status(400).json({
            message: "Bad Request",
            errors: "No request body found"
        })
    }
    console.log({name, email, countryCode, phone, password})
    if(!phone){
        countryCode = null,
        phone = null
    }
    else if(phone.includes('-')){
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
        return res.status(500).json({
            message: "User already exists",
            errors
        })
    }

    if(!name) errors.name = "Name is required"
    else if(name.length < 3 || name.length > 25) errors.name = "Name must have 3-25 characters"

    if(!email) errors.email = "Email is required"
    else if(email.length > 256) errors.email = "Email must have 256 characters or less"

    if(!password) errors.password = "Password is required";
    else if(password.length < 6 || password.length > 25) errors.password = "Password must be between 6 and 25 characters"
    if(phone && phone.length !== 10) errors.phone = "Phone number must have 10 digits"

    if(Object.keys(errors).length > 0){
        return res.status(400).json({
            message: "Bad Request",
            errors
        })
    }

    try{
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
    } catch(error){
        console.error("Error creating user:", error)

        return res.status(500).json({
            messgae: "Internal Server Error",
            error: error.message || "Something went wrong creating user"
        })
    }
})

// Edit a user by id
router.put("/:id", async(req, res)=>{
    const { id } = req.params
    let {name, email, countryCode, phone} = req.body
    const errors = {}

    if(!req.body){
        return res.status(400).json({
            message: "Bad Request",
            errors: "No request body found"
        })
    }
    if(!id){
        return res.status(400).json({
            message: "Bad Request",
            errors: "No user id found in request params"
        })
    }
    if(name && (name.length > 25 || name.length < 3)){
        errors.name = "Name must be between 3 and 25 characters"
    }
    if(email && email.length > 256) errors.email = "Email must have 256 characters or less"

    if(phone && phone.length !== 10) errors.phone = "Phone number must have 10 digits"
    else if(phone && phone.includes('-')) phone = phone.split('-').join('')

    if(Object.keys(errors).length > 0){
        return res.status(400).json({
            message: "Bad request",
            errors
        })
    }

    if(typeof req.body !== 'object'){
        return res.status(400).json({
            message: "Bad Request",
            errors: "Request body must be an object"
        })
    }

    Object.keys(req.body).forEach(key=>{
        if(key !== 'name' && key !== 'email' && key !== 'countryCode' && key !== 'phone'){
            delete req.body[key]
            console.log(`"${key}" is not a valid field for update, deleting from request body`)
        }
    })

    const user = await User.findByPk(id)
    if(!user){
        return res.status(404).json({
            message: "User not found",
            errors: "No user found with the given id"
        })
    }
    try{
        await user.update(req.body)

        return res.status(200).json({
            message: 'Updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                countryCode: user.countryCode,
                phone: user.phone
            }
        })
    } catch(error){
        console.error("Error editing user:", error)
        return res.status(500).json({
            message: "Ineternal Server Error",
            error: error.message || "Something went wrong editing user"
        })
    }
})




// Delete a user by id
router.delete("/:id", async(req, res)=>{
    const { id } = req.params

    const user = await User.findByPk(id)
    if(!user){
        return res.status(404).json({
            message: "User not found",
            errors: "No user found with the given id"
        })
    }

    try{
        await user.destroy()

        return res.status(200).json({
            message: "User deleted successfully"
        })
    } catch(error){
        console.error("Error deleting user:", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "Something went wrong deleting the user"
        })
    }
})

module.exports = router