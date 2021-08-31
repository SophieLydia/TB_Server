const express = require('express');
const router = express.Router();
const Theme = require('../models/Theme');

//Get all the themes
router.get('/', async (req, res) => {     
    try{
        const themes = await Theme.find(
            req.query.title ? {"title":  {"$regex": req.query.title, "$options": 'i'}} : {},
        )
        .select({"title": 1, "_id":1});
        res.json(themes);
    }catch(err){
        res.status(404).send("Themes not found");
    }
});

//Get a specific theme by id
router.get('/:id', async (req, res) => {      
    try{
        const theme = await Theme.findById(req.params.id);
        res.json(theme);
    }catch(err){
        res.status(404).send("Theme not found");
    }
});

//Submit a theme
router.post('/', async (req, res) => {
    const theme = new Theme({
        title: req.body.title,
        description: req.body.description    
    });
    try{
        const savedTheme = await theme.save();
        res.status(201);
        res.json(savedTheme);
    }catch(err){
        res.status(400).send("Bad request");
    }
});

//Delete a specific theme by id
router.delete('/:id', async (req, res) => {
    try{
        const removedTheme = await Theme.deleteOne({_id: req.params.id});
        res.json(removedTheme);
    }catch(err){
        res.status(404).send("Theme not found");
    }
});

//Update a specific theme by id
router.patch('/:id', async (req, res) => {
    try{
        const updatedTheme = await Theme.updateOne(
            {_id: req.params.id},
            {$set: req.body
        });
        res.json(updatedTheme);
    }catch(err){
        res.status(404).send("Theme not found");
    }
});

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Theme:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The ID of the theme
 *           example: 780new89hf83efbd2r34
 *         title:
 *           type: string
 *           description: The title of the theme
 *           example: Introduction to Gmail
 *     NewTheme:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the theme
 *           example: Introduction to Gmail
 *         description:
 *           type: string
 *           description: The description of the theme
 *           example: It introduces Gmail, how to create an account, etc.
 *     ThemeDetails:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The theme's ID
 *               example: 0fjk3984wb30jfd4
 *         - $ref: '#/components/schemas/NewTheme'     
 */

/**
 * @swagger
 * /themes:
 *   get:
 *     summary: Retrieve a list of themes
 *     description: Retrieve a list of themes in the system
 *     tags:
 *       - themes
 *     parameters:
 *       - in: query
 *         name: title
 *         schema: 
 *           type: string
 *         description: The title to filter the result with
 *     responses:
 *       200:
 *         description: A list of themes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Theme'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /themes/{id}:
 *   get:
 *     summary: Retrieve a single theme
 *     description: Retrieve a single theme corresponding to the given id
 *     tags:
 *       - themes
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the theme to retrieve
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: A single theme
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ThemeDetails'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /themes:
 *   post:
 *     summary: Create a theme
 *     description: Create a theme 
 *     tags:
 *       - themes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTheme'
 *             required: 
 *                 - title
 *                 - description
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ThemeDetails'
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /themes/{id}:
 *   delete:
 *     summary: Delete a theme
 *     description: Delete a theme corresponding to the given id
 *     tags:
 *       - themes
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the theme to delete
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
 * /themes/{id}:
 *   patch:
 *     summary: Update a theme
 *     description: Update a theme corresponding to the given id
 *     tags:
 *       - themes
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the theme to patch
 *         schema: 
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTheme'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */