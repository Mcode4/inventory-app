const router = require('express').Router()
const { Folder, User } = require("../../db/models")

//Maybe create a helper function for updating order

// Get folders for a user
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
        const folders = await Folder.findAll({where:{ownerId}})

        if(!folders){
            return res.status(404).json({
                message: "Folders not found",
                errors: "No folders found for the given user id"
            })
        }
        
        return res.status(200).json(folders)

    } catch(error){
        console.error("Error fetching folders:", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "Something went wrong fetching folders"
        })
    }
})

// Create a folder
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
            errors: "Name is required"
        })
    }

    if(!template) template = null
    let newFolder

    try{
        newFolder = await Folder.create({
            ownerId,
            name,
            template,
            order: null
        })
        // Sorting algorithm to find order
        let folders = await Folder.findAll({where:{ownerId}, order: [["name", "DESC"]]})
        let i=1
        let newFolderOrder

        folders.forEach(folder=>{
            folder.update({order: i})

            if(folder.id === newFolder.id){
                newFolderOrder = i
            }

            i++
        })

        //Then
        return res.status(201).json({
            message: "Successfully created folder",
            folder: {
                id: newFolder.id,
                ownerId: newFolder.ownerId,
                name: newFolder.name,
                template: newFolder.template,
                order: newFolderOrder
            }
        })

    } catch(error){
        console.error("Error creating folder:", error)
        return res.status(400).json({
            message: "Internal Server Error",
            error: error.message || "Something when wrong creating folder"
        })
    }

    
})

// Edit a folder
router.put("/:folderId", async(req, res)=>{
    const { folderId } = req.params
    const folder = await Folder.findByPk(folderId)
    let orderUpdate = false
    
    if(!folder){
        return res.status(404).json({
            message: "Folder not found",
            errors: "No folder found with the given id"
        })
    }

    Object.keys(req.body).forEach(key=>{
        if(key !== 'name' && key !== 'template'){
            delete req.body[key] // remove any unwanted keys from the request body
            console.log(`"${key}" is not a valid field for update, deleting from request body`)
        }
        if(key === 'name') orderUpdate = true
    })

    try{
        folder.update(req.body)
        let folderOrder

        if(orderUpdate){
            const ownerId = folder.ownerId
            let folders = await Folder.findAll({where: {ownerId}, order: [["name", "DESC"]]})
            let i=1

            folders.forEach(folder2=>{
                folder2.update({order: i})
                if(folder2.id === folder.id) folderOrder = i

                i++
            })
        }

        return res.status(200).json({
            message: "Successfully updated folder",
            folder: {
                id: folder.id,
                ownerId: folder.ownerId,
                name: folder.name,
                template: folder.template,
                order: folderOrder || folder.order
            }
        })
    } catch(error){
        console.error("Error updateing folder:", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "Something went wrong updating folder"
        })
    }

})

// Delete a folder
router.delete("/:id", async(req, res)=>{
    const { id } = req.params

    const folder = await Folder.findByPk(id)
    if(!folder){
        return res.status(404).json({
            message: "Folder not found",
            errors: "No folder found with the given id"
        })
    }

    try{
        await folder.destroy()

        return res.status(200).json({
            message: "Successfully deleted folder"
        })
    } catch(error){
        console.error("Error deleting folder:", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "Something went wrong deleting folder"
        })
    }
})

module.exports = router