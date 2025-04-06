const router = require('express').Router()
const { File, User } = require("../../db/models")

//Maybe create a helper function for updating order

// Get files for a user
router.get("/:ownerId", async(req, res)=>{
    const { ownerId } = req.params
    const user = User.findByPk(ownerId)
    if(!user){
        return res.status(404).json({
            message: "User not found",
            errors: "No user found with the given id"
        })
    }
    
    try{
        const files = await File.findAll({where:{ownerId}})

        if(!files){
            return res.status(404).json({
                message: "Files not found",
                errors: "No files found for the given user id"
            })
        }
        
        return res.status(200).json(files)

    } catch(error){
        console.error("Error fetching files:", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "Something went wrong fetching files"
        })
    }
})

// Create a file
router.post("/:ownerId", async(req, res)=>{
    const { ownerId } = req.params
    let { name, template } = req.body // template is optional

    const user = User.findByPk(ownerId)
    if(!user){
        return res.status(404).json({
            message: "User not found",
            errors: "No user found with the given id"
        })
    }

    if(!name){
        return res.status(400).json({
            message: "Validation Error",
            errors: "File name is required"
        })
    }

    if(!template) template = null
    let newFile

    try{
        newFile = await File.create({
            ownerId,
            name,
            template,
            data : null
        })
    } catch(error){
        console.error("Error creating file:", error)
        return res.status(400).json({
            message: "Internal Server Error",
            error: error.message || "Something when wrong creating file"
        })
    }

    // Sorting algorithm to find order
    const files = await File.findall({where:{ownerId}})

    console.log(files) // Create loop and update the orders

    //Then
    return res.status(201).json({
        message: "Successfully created file",
        file: {
            id: newFile.id,
            ownerId: newFile.ownerId,
            name: newFile.name,
            template: newFile.template,
            order: newFile.order,
            data: newFile.data
        }
    })
})

// Edit a file
router.put("/:id", async(req, res)=>{
    const { id } = req.params
    const file = await File.findByPk(id)
    if(!file){
        return res.status(404).json({
            message: "File not found",
            errors: "No file found with the given id"
        })
    }

    Object.keys(req.body).forEach(key=>{
        if(key !== 'name' && key !== 'template'){
            delete req.body[key] // remove any unwanted keys from the request body
            console.log(`"${key}" is not a valid field for update, deleting from request body`)
        }
    })

    // Validate if order if between the first and last order or is 1 or 1 number from last
    // Update the order if needed

    try{
        file.update(req.body)

        return res.status(200).json({
            message: "Successfully updated file",
            file: {
                id: file.id,
                ownerId: file.ownerId,
                name: file.name,
                template: file.template,
                order: file.order,
                data: file.data
            }
        })
    } catch(error){
        console.error("Error updateing file:", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "Something went wrong updating file"
        })
    }

})

// Delete a file
router.delete("/:id", async(req, res)=>{
    const { id } = req.params

    const file = await File.findByPk(id)
    if(!file){
        return res.status(404).json({
            message: "File not found",
            errors: "No file found with the given id"
        })
    }

    try{
        await file.destroy()

        return res.status(200).json({
            message: "Successfully deleted file"
        })
    } catch(error){
        console.error("Error deleting file:", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "Something went wrong deleting file"
        })
    }
})

module.exports = router