const express = require('express');
const router = express();
const Project = require('../models/Projects')
const cors = require('cors');

router.options('*', cors())

router.get('/projects', cors(),async (req, res)=>{
    try {
        const projects = await Project.find({})
        res.status(200).send({projects: projects})
    } catch (error) {
        res.status(301).send({"err": "Error Occured"})
        
    }
})

router.get('/projects/:id', cors(),async (req, res)=>{
    try {
        const project = await Project.findById(req.params.id)
        res.status(200).send({project: project})
    } catch (error) {
        throw error;
        res.status(301).send({"err": "Error Occured"})
    }
})
router.get('/projects/delete-project/:id', cors(), async function(req, res){
    const id = req.params.id
    const db = await Project.findById(id)

    try {
        await Project.deleteOne({ _id: db._id });
        res.status(200).send({"msg": "Project Successfully Deleted"})
    } catch (error){
        res.status(203).send({"err": "Something went wrong"}) 
    }
})


router.post('/projects/add-project', cors(),async (req, res)=>{
    const title = req.body.title
    const description = req.body.description
    const documentation = req.body.documentation
    const liveLink = req.body.liveLink
    const videoLink = req.body.videoLink
    const codeLink = req.body.codeLink
    const diagram = req.body.diagram
    const thumbImage = req.body.thumbImage

    var newProject = new Project({
        title: title,
        description: description, 
        documentation: documentation, 
        liveLink: liveLink, 
        videoLink: videoLink, 
        codeLink: codeLink, 
        diagram: diagram, 
        thumbImage: thumbImage 
    });

    try {
        await newProject.save()
        res.status(200).send({"msg": 'Project Added'}); 
    } catch (error) {
        res.status(500).send({"err": 'Make sure all fields are filled'}); 
    }

})

router.post('/projects/edit-project/:id', cors(), async function(req, res){
    const id = req.params.id
    const title = req.body.title
    const description = req.body.description
    const documentation = req.body.documentation
    const liveLink = req.body.liveLink
    const videoLink = req.body.videoLink
    const codeLink = req.body.codeLink
    const diagram = req.body.diagram
    const thumbImage = req.body.thumbImage

    try {
        const doc = await Project.findOneAndUpdate({_id: id}, { title: title,description: description, documentation: documentation, liveLink: liveLink, videoLink: videoLink, codeLink: codeLink, diagram: diagram, thumbImage: thumbImage}, {
          new: true
        });        
        res.status(200).send({"msg": "Project Updated"})
    } catch (error) {
        
        res.status(203).send({"err": 'Make sure all fields are filled'}); 
    }
})

module.exports = router