const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const QueryByCantonClasses = require('../someMiddlewares/queryByCantonClasses');
const mongoose = require('mongoose');

//Use the word "class_" instead of "class" because it's a reserved word

//Get all the classes that match the given fields 
//filter on periode and/or canton
router.get('/', async (req, res) => {     
    try{
        const classes = await Class.find({
            "$and": [
                req.query.periode ? {"periode":  req.query.periode} : {},
                req.query.canton ? {"_id": {"$in": await QueryByCantonClasses(req.query.canton)}} : {}
            ]
        }).populate({path: "cantonId", select: "name"})
        .select({"periode": 1, "_id":1});
        res.json(classes);
    }catch(err){
        res.status(404).send("Classes not found");
    }
});

//Get a specific class by id
router.get('/:id', async (req, res) => {    
    try{
        const class_ = await Class.findById(req.params.id)
        .populate({path: "cantonId", select: "name"})
        .select({"periode": 1, "_id":1});;
        res.json(class_);
    }catch(err){
        res.status(404).send("Class not found");
    }
});

//Submit a class
router.post('/', async (req, res) => { 
    const class_ = new Class({
        cantonId: req.body.cantonId,
        periode: req.body.periode
    });
    try{
        const savedClass = await class_.save();
        res.status(201);
        res.json(savedClass);
    }catch(err){
        if(err instanceof mongoose.Error.ValidationError){
            if(err.errors[Object.keys(err.errors)[0]].path == "cantonId"){
                res.status(404).send("Canton not found");
            }
        }else{
            res.status(400).send("Bad request");
        }
    }
});

//Delete a specific class by id
router.delete('/:id', async (req, res) => {
    try{
        const removedClass = await Class.deleteOne({_id: req.params.id});
        res.json(removedClass);
    }catch(err){
        res.status(404).send("Canton not found");
    }
});

//Update a specific class by id
router.patch('/:id', async (req, res) => {
    try{
        const updatedClass = await Class.updateOne(
            {_id: req.params.id},
            {$set: req.body
        });
        res.json(updatedClass);
    }catch(err){
        res.status(404).send("Canton not found");
    }
});

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     NewClass:
 *       type: object
 *       properties:
 *         cantonId:
 *           type: string
 *           description: The id of the canton
 *           example: 93gf993272bdd0f0843
 *         periode:
 *           type: string
 *           description: The periode when the class is given
 *           example: morning
 *     Class:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The class's ID
 *               example: 0fjk3984wb30jfd4
 *         - $ref: '#/components/schemas/NewClass'     
 *     ClassDetails:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The class's ID
 *           example: 0fjk3984wb30jfd4
 *         cantonId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The id of the canton
 *               example: 93gf993272bdd0f0843
 *             name:
 *               type: string
 *               description: The name of the canton
 *               example: Jura
 *         periode:
 *           type: string
 *           description: The period of the day dedicated to the class (morning or afternoon)
 *           example: morning
 */

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Retrieve a list of classes
 *     description: Retrieve a list of classes in the system
 *     tags:
 *       - classes
 *     parameters:
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *         description: The class periode to filter the result with
 *       - in: query
 *         name: canton
 *         schema: 
 *           type: string
 *         description: The canton to filter the result with
 *     responses:
 *       200:
 *         description: A list of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClassDetails'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Retrieve a single class
 *     description: Retrieve a single class corresponding to the given id
 *     tags:
 *       - classes
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the class to retrieve
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: A single class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ClassDetails'
 *       404:
 *         description: Not found
 */ 

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a class
 *     description: Create a class 
 *     tags:
 *       - classes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewClass'
 *             required: 
 *                 - cantonId
 *                 - periode
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     description: Delete a class corresponding to the given id
 *     tags:
 *       - classes
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the class to delete
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
 * /classes/{id}:
 *   patch:
 *     summary: Update a class
 *     description: Update a class correspondong to the given id
 *     tags:
 *       - classes
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the class to patch
 *         schema: 
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewClass'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */