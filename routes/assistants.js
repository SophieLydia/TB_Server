const express = require('express');
const router = express.Router();
const Assistant = require('../models/Assistant');
const Person = require('../models/Person');
const mongoose = require('mongoose');

//Get a specific assistant
router.get('/:id', async (req, res) => {    
    try{
        const assistant = await Assistant.findById(req.params.id)
        .populate("_id")
        .populate({path: "cantonId", select: "name"});
        res.json(assistant);
    }catch(err){
        res.status(404).send("Assistant not found");
    }
});

//Submit an assistant
router.post('/', async (req, res) => {
    const assistant = new Assistant({
        _id: req.body._id,
        cantonId: req.body.cantonId,
        salary: req.body.salary
    });
    try{
        const savedAssistant = await assistant.save();
        const checkRole = await Person.findById(savedAssistant._id);
        if(checkRole.role != "assistant"){
            await Assistant.deleteOne({_id: req.body._id});
            throw new Error ("role");
        }
        res.status(201);
        res.json(savedAssistant);
    }catch(err){
        var message = "";
        if(err instanceof mongoose.Error.ValidationError){
            for(field in err.errors){
                switch(err.errors[field].path){
                    case "_id":
                        message += "Person not found";
                        break;
                    case "cantonId":
                        if(message != ""){
                            message += " and canton not found";
                        }else{
                            message += "Canton not found";
                        }
                        break;
                }
            }
        }
        if(message != ""){
            res.status(404).send(message);
        }else if(err = "role"){
            res.status(400).send("Role of the person is not assistant");
        }else{
            res.status(400).send("Bad request");
        }
    }
});

//Delete a specific assistant by id
router.delete('/:id', async (req, res) => {
    try{
        const removedAssistant = await Assistant.deleteOne({_id: req.params.id});
        res.json(removedAssistant);
    }catch(err){
        res.status(404).send("Assistant not found");
    }
});

//Update a specific assistant by id
router.patch('/:id', async (req, res) => {
    try{
        const updatedAssistant = await Assistant.updateOne(
            {_id: req.params.id},
            {$set: req.body
        });
        res.json(updatedAssistant);
    }catch(err){
        res.status(404).send("Assistant not found");
    }
});

module.exports = router;



/**
 * @swagger
 * components:
 *   schemas:
 *     NewAssistant:
 *       type: object
 *       properties:
 *         salary:
 *           type: double
 *           description: The salary per hour of the assistant
 *           example: 20
 *         _id:
 *           type: string
 *           description: The assistant's ID
 *           example: 0fjk3984wb30jfd4
 *         cantonId:
 *           type: string
 *           description: The canton's ID
 *           example: 0fjk3984wb30jfd4
 *     AssistantDetails:
 *      allOf:
 *         - $ref: '#/components/schemas/NewAssistant' 
 *         - type: object
 *           properties:
 *             cantonName:
 *               type: string
 *               description: The canton's name
 *               example: Jura
 *         - $ref: '#/components/schemas/NewPerson'
 */

/**
 * @swagger
 * /assistants/{id}:
 *   get:
 *     summary: Retrieve a single assistant
 *     description: Retrieve a single assistant corresponding to the given id
 *     tags:
 *       - assistants
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the assistant to retrieve
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: Get a single assistant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AssistantDetails'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /assistants:
 *   post:
 *     summary: Create an assistant
 *     description: Create an assistant 
 *     tags:
 *       - assistants
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewAssistant'
 *             required: 
 *                 - _id
 *                 - cantonId
 *                 - salary
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/NewAssistant'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /assistants/{id}:
 *   delete:
 *     summary: Delete an assistant
 *     description: Delete an assistant corresponding to the given id
 *     tags:
 *       - assistants
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the assistant to delete
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /assistants/{id}:
 *   patch:
 *     summary: Update an assistant
 *     description: Update an assistant correspondong to the given id
 *     tags:
 *       - assistants
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the assistant to patch
 *         schema: 
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               salary:
 *                 type: double
 *                 description: The salary per hour of the assistant
 *                 example: 20
 *               cantonId:
 *                 type: string
 *                 description: The canton's ID
 *                 example: 0fjk3984wb30jfd4
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */