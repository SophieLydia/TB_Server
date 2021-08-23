const express = require('express');
const router = express.Router();
const Child = require('../models/Child');
const Person = require('../models/Person');
const mongoose = require('mongoose');

//Get a specific child
router.get('/:id', async (req, res) => {    
    try{
        const child = await Child.findById(req.params.id)
        .populate('_id')
        .populate({path: "classId", select: "periode", populate:{path: "cantonId", select: "name"}});
        res.json(child);
    }catch(err){
        res.status(404).send("Child not found");
    }
});

//Submit a child
router.post('/', async (req, res) => {
    const child = new Child({
        _id: req.body._id,
        classId: req.body.classId,
        parentalStatement: req.body.parentalStatement,
        allergy: req.body.allergy
    });
    try{
        const savedChild = await child.save();
        const checkRole = await Person.findById(savedChild._id);
        if(checkRole.role != "child"){
            await Child.deleteOne({_id: req.body._id});
            throw new Error ("role");
        }
        res.status(201);
        res.json(savedChild);
    }catch(err){
        var message = "";
        if(err instanceof mongoose.Error.ValidationError){
            for(field in err.errors){
                switch(err.errors[field].path){
                    case "_id":
                        message += "Person not found";
                        break;
                    case "classId":
                        if(message != ""){
                            message += " and class not found";
                        }else{
                            message += "Class not found";
                        }
                        break;
                }
            }
        }
        if(message != ""){
            res.status(404).send(message);
        }else if(err = "role"){
            res.status(400).send("Role of the person is not child");
        }else{
            res.status(400).send("Bad request");
        }
    }
});

//Delete a specific child by id
router.delete('/:id', async (req, res) => {
    try{
        const removedChild = await Child.deleteOne({_id: req.params.id});
        res.json(removedChild);
    }catch(err){
        res.status(404).send("Child not found");
    }
});

//Update a specific child by id
router.patch('/:id', async (req, res) => {
    try{
        const updatedChild = await Child.updateOne(
            {_id: req.params.id},
            {$set: req.body
        });
        res.json(updatedChild);
    }catch(err){
        res.status(404).send("Child not found");
    }
});

module.exports = router;



/**
 * @swagger
 * components:
 *   schemas:
 *     NewChild:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The child's ID
 *           example: 0fjk3984wb30jfd4
 *         parentalStatement:
 *           type: boolean
 *           description: True if the parental statement of the child has been signed, false otherwise
 *           example: false
 *         allergy:
 *           type: string
 *           description: Allergies of the children regarding food for snacks
 *           example: lactose
 *         classId:
 *           type: string
 *           description: The person's ID
 *           example: 0fjk3984wb30jfd4
 *     ChildDetails:
 *      allOf:
 *         - $ref: '#/components/schemas/NewChild' 
 *         - $ref: '#/components/schemas/NewPerson'
 *         - $ref: '#/components/schemas/ClassDetails'
 */

/**
 * @swagger
 * /children/{id}:
 *   get:
 *     summary: Retrieve a single child
 *     description: Retrieve a single child corresponding to the given id
 *     tags:
 *       - children
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the child to retrieve
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: A single child
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ChildDetails'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /children:
 *   post:
 *     summary: Create a child
 *     description: Create a child 
 *     tags:
 *       - children
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewChild'
 *             required: 
 *                 - _id
 *                 - classId
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/NewChildDetails'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /children/{id}:
 *   delete:
 *     summary: Delete a child
 *     description: Delete a child corresponding to the given id
 *     tags:
 *       - children
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the child to delete
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
 * /children/{id}:
 *   patch:
 *     summary: Update a child
 *     description: Update a child correspondong to the given id
 *     tags:
 *       - children
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the child to patch
 *         schema: 
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewChild'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */