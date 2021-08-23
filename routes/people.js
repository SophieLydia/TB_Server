const express = require('express');
const router = express.Router();
const Person = require('../models/Person');
const queryByCanton = require('../someMiddlewares/queryByCanton');
const queryByClassChildren = require('../someMiddlewares/queryByClassChildren');
const queryByName = require('../someMiddlewares/queryByName');


//Get all the people that match the given fields 
//filter on role, name, canton and/or periode
router.get('/', async (req, res) => {    
    try{
        const people = await Person.find({
            "$and": [
                req.query.role ? {"role":  req.query.role} : {},
                req.query.name ? {"_id": {"$in": await queryByName(req.query.name)}} : {},
                req.query.canton ? {"_id": {"$in": await queryByCanton(req.query.canton)}} : {},
                req.query.periode ? {"_id": {"$in": await queryByClassChildren(req.query.periode)}} : {} 
            ]
        }).select({"lastName": 1, "firstName":1, "role":1, "_id":1});
        res.json(people);
    }catch(err){
        res.status(404).send("People not found");
    }
});

//Get a specific person
router.get('/:id', async (req, res) => {    
    try{
        const person = await Person.findById(req.params.id);
        res.json(person);
    }catch(err){
        res.status(404).send("Person not found");
    }
});

//Submit a person
router.post('/', async (req, res) => {
    const person = new Person({
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: {
            postCode: req.body.address.postCode,
            city: req.body.address.city,
            streetName: req.body.address.streetName,
            streetNumber: req.body.address.streetNumber
        },
        role: req.body.role
    });
    try{
        const savedPerson = await person.save();
        res.status(201);
        res.json(savedPerson);
    }catch(err){
        res.status(400).send("Bad request");
    }
});

//Delete a specific person by id
router.delete('/:id', async (req, res) => {
    try{
        const removedPerson = await Person.deleteOne({_id: req.params.id});
        res.json(removedPerson);
    }catch(err){
        res.status(404).send("Person not found");
    }
});

//Update a specific person by id
router.patch('/:id', async (req, res) => {
    //Merging objects with one level nesting for update (setObject is the "new" req.body)
    const setObject = {};
    for(key in req.body){
        if (typeof req.body[key] === 'object') {   // == is equal and === is strictly equal
            for(subkey in req.body[key]){
                setObject[`${key}.${subkey}`] = req.body[key][subkey];
            }           
        } else {
            setObject[key] = req.body[key];
        }
    }
    try{
        if(setObject["role"] != undefined){
            if(! (setObject["role"] == "boss" || setObject["role"] == "assistant" || setObject["role"] == "child")){
                throw new Error ("role");
            }
        }
        const updatedPerson = await Person.updateOne(
            {_id: req.params.id},
            {$set: setObject
        });
        res.json(updatedPerson);
    }catch(err){
        if(err.message == "role"){
            res.status(400).send("The role is not boss, assistant or child");
        }else{
            res.status(404).send("Person not found");
        }
    }
});

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     NewPerson:
 *       type: object
 *       properties:
 *         address:
 *           type: object
 *           properties:
 *             postCode:
 *               type: integer
 *               description: The post code of the person's address
 *               example: 2800
 *             city:
 *               type: string
 *               description: The city of the person's address
 *               example: Delémont
 *             streetName:
 *               type: string
 *               description: The street name of the person's address
 *               example: Longs-Champs
 *             streetNumber:
 *               type: integer
 *               description: The street number of the person's address
 *               example: 14
 *         lastName:
 *           type: string
 *           description: The last name of the person
 *           example: Dupond
 *         firstName:
 *           type: string
 *           description: The first name of the person
 *           example: Olivier
 *         email:
 *           type: string
 *           description: The email of the person
 *           example: olivier.dupond@mail.com
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the person
 *           example: +41 78 888 88 88
 *         role:
 *           type: string
 *           desscription: The role of the person in the system (child, assistant or boss)
 *           example: child
 *     PersonDetails:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The person's ID
 *               example: 0fjk3984wb30jfd4
 *         - $ref: '#/components/schemas/NewPerson'
 *     Person:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The person's ID
 *           example: 0fjk3984wb30jfd4
 *         lastName:
 *           type: string
 *           description: The last name of the person
 *           example: Dupond
 *         firstName:
 *           type: string
 *           description: The first name of the person
 *           example: Olivier
 *         role:
 *           type: string
 *           desscription: The role of the person in the system (child, assistant or boss)
 *           example: child
 *           
 */

/**
 * @swagger
 * /people:
 *   get:
 *     summary: Retrieve a list of people
 *     description: Retrieve a list of people in the system. We can filter the result 
 *       by role, name, canton and/or class periode
 *     tags:
 *       - people
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: 
 *           type: string
 *         description: The role to filter the result with
 *       - in: query
 *         name: name
 *         schema: 
 *           type: string
 *         description: The name to filter the result with
 *       - in: query
 *         name: canton
 *         schema: 
 *           type: string
 *         description: The canton to filter the result with
 *       - in: query
 *         name: periode
 *         schema: 
 *           type: string
 *         description: The class periode to filter the result with
 *     responses:
 *       200:
 *         description: A list of people
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Person'
 *       404:
 *         description: Not found
 */


/**
 * @swagger
 * /people/{id}:
 *   get:
 *     summary: Retrieve a single person
 *     description: Retrieve a single person corresponding to the given id
 *     tags:
 *       - people
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the person to retrieve
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: A single person
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PersonDetails'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /people:
 *   post:
 *     summary: Create a person
 *     description: Create a person 
 *     tags:
 *       - people
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewPerson'
 *             required: 
 *                 - lastName
 *                 - firstName
 *                 - email
 *                 - phoneNumber
 *                 - address
 *                 - role
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PersonDetails'
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /people/{id}:
 *   delete:
 *     summary: Delete a person
 *     description: Delete a person corresponding to the given id
 *     tags:
 *       - people
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the person to delete
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
 * /people/{id}:
 *   patch:
 *     summary: Update a person
 *     description: Update a person correspondong to the given id
 *     tags:
 *       - people
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: ID of the person to patch
 *         schema: 
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewPerson'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */