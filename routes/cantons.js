const express = require('express');
const router = express.Router();
const Canton = require('../models/Canton');

//Get all the cantons that match the given field 
//filter on name
router.get('/', async (req, res) => {     
    try{
        const cantons = await Canton.find(
            req.query.name ? {"name": {"$in": req.query.name}} : {}
        )
        .select({"name": 1, "_id":1});
        res.json(cantons);
    }catch(err){
        res.status(404).send("Cantons not found");
    }
});

//Get a specific canton by id
router.get('/:id', async (req, res) => {      
    try{
        const canton = await Canton.findById(req.params.id);
        res.json(canton);
    }catch(err){
        res.status(404).send("Canton not found");
    }
});

//Submit a canton
router.post('/', async (req, res) => {
    const canton = new Canton({
        name: req.body.name,
        budget: req.body.budget,
        address: {
            postCode: req.body.address.postCode,
            city: req.body.address.city,
            streetName: req.body.address.streetName,
            streetNumber: req.body.address.streetNumber
        }
    });
    try{
        const savedCanton = await canton.save();
        res.status(201);
        res.json(savedCanton);
    }catch(err){
        res.status(400).send("Bad request");
    }
});

//Delete a specific canton by id
router.delete('/:id', async (req, res) => {
    try{
        const removedCanton = await Canton.deleteOne({_id: req.params.id});
        res.json(removedCanton);
    }catch(err){
        res.status(404).send("Canton not found");
    }
});

//Update a specific canton by id
router.patch('/:id', async (req, res) => {
    //Merging objects with one level nesting for update (setObject is the "new" req.body)
    const setObject = {};
    for(key in req.body){
        if (typeof req.body[key] === 'object') {  
            for(subkey in req.body[key]){
                setObject[`${key}.${subkey}`] = req.body[key][subkey];
            }           
        } else {
            setObject[key] = req.body[key];
        }
    }
    try{
        const updatedCanton = await Canton.updateOne(
            {_id: req.params.id},
            {$set: setObject
        });
        res.json(updatedCanton);
    }catch(err){
        res.status(404).send("Canton not found");
    }
});

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     NewCanton:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the canton
 *           example: Jura
 *         budget:
 *           type: double
 *           description: The budget dedicated to the canton
 *           example: 350
 *         address:
 *           type: object
 *           properties:
 *             postCode:
 *               type: integer
 *               description: The post code of the canton's address
 *               example: 2900
 *             city:
 *               type: string
 *               description: The city of the canton's address
 *               example: Porrentruy
 *             streetName:
 *               type: string
 *               description: The street name of the canton's address
 *               example: Sous-Bellevue
 *             streetNumber:
 *               type: integer
 *               description: The street number of the canton's address
 *               example: 15
 *     Canton:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The canton's ID
 *               example: 0fjk3984wb30jfd4
 *         - $ref: '#/components/schemas/NewCanton' 
 *     ListCanton:    
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The canton's ID
 *           example: 0fjk3984wb30jfd4
 *         name:
 *           type: string
 *           description: The name of the canton
 *           example: Jura
 */

/**
 * @swagger
 * /cantons:
 *   get:
 *     summary: Retrieve a list of cantons
 *     description: Retrieve a list of cantons in the system. We can filter the result 
 *       by name
 *     tags:
 *       - cantons
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: 
 *           type: string
 *         description: The name to filter the result with
 *     responses:
 *       200:
 *         description: A list of cantons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ListCanton'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /cantons/{id}:
 *   get:
 *     summary: Retrieve a single canton
 *     description: Retrieve a single canton corresponding to the given id
 *     tags:
 *       - cantons
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the canton to retrieve
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: A single canton
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Canton'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /cantons:
 *   post:
 *     summary: Create a canton
 *     description: Create a canton 
 *     tags:
 *       - cantons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCanton'
 *             required: 
 *                 - name
 *                 - address
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Canton'
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /cantons/{id}:
 *   delete:
 *     summary: Delete a canton
 *     description: Delete a canton corresponding to the given id
 *     tags:
 *       - cantons
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the canton to delete
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
 * /cantons/{id}:
 *   patch:
 *     summary: Update a canton
 *     description: Update a canton corresponding to the given id
 *     tags:
 *       - cantons
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the canton to patch
 *         schema: 
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCanton'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */