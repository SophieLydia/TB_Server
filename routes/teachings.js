const express = require('express');
const router = express.Router();
const Teaching = require('../models/Teaching');
const Person = require('../models/Person');
const QueryByName = require('../someMiddlewares/queryByName');
const QueryByThemeCourses = require('../someMiddlewares/queryByThemeCourses');
const QueryByCantonCourses = require('../someMiddlewares/queryByCantonCourses');
const QueryByDate = require('../someMiddlewares/queryByDate');
const mongoose = require('mongoose');

//Get all the teachings that match the given fields 
//filter on name of the assistant, title of the theme and/or date
router.get('/', async (req, res) => {     
    try{
        const teachings = await Teaching.find({
            "$and": [
                req.query.assistantName ? {"assistantId":  {"$in": await QueryByName(req.query.assistantName)}} : {},
                req.query.courseTheme ? {"courseId": {"$in": await QueryByThemeCourses(req.query.courseTheme)}} : {},
                req.query.canton ? {"courseId": {"$in": await QueryByCantonCourses(req.query.canton)}} : {},
                req.query.date ? {"courseId": {"$in": await QueryByDate(req.query.date)}} : {}
            ]
        })
        .populate({path: "assistantId", populate:{path: "_id", select: "firstName lastName"}})
        .populate({path: "courseId", populate:{path: "classId"}})
        .select({"_id":1});
        res.json(teachings);
    }catch(err){
        res.status(404).send("Teachings not found");
    }
});

//Get a specific teaching by id
router.get('/:id', async (req, res) => {      
    try{
        const teaching = await Teaching.findById(req.params.id)
        .populate("assistantId").populate("courseId");
        res.json(teaching);
    }catch(err){
        res.status(404).send("Teaching not found");
    }
});

//Submit a teaching
router.post('/', async (req, res) => {
    const teaching = new Teaching({
        assistantId: req.body.assistantId,
        courseId: req.body.courseId,
    });
    try{
        const savedTeaching = await teaching.save();
        const checkRole = await Person.findById(savedTeaching.assistantId);
        if(checkRole.role != "assistant"){
            await Teaching.deleteOne({_id: savedTeaching._id});
            throw new Error ("role");
        }
        res.status(201);
        res.json(savedTeaching);
    }catch(err){
        var message = "";
        if(err instanceof mongoose.Error.ValidationError){
            for(field in err.errors){
                switch(err.errors[field].path){
                    case "assistantId":
                        message += "Assistant not found";
                        break;
                    case "CourseId":
                        if(message != ""){
                            message += " and course not found";
                        }else{
                            message += "Course not found";
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

//Delete a specific teaching by id
router.delete('/:id', async (req, res) => {
    try{
        const removedTeaching = await Teaching.deleteOne({_id: req.params.id});
        res.json(removedTeaching);
    }catch(err){
        res.status(404).send("Teaching not found");
    }
});

//Update a specific teaching by id
router.patch('/:id', async (req, res) => {
    try{
        const updatedTeaching = await Teaching.updateOne(
            {_id: req.params.id},
            {$set: req.body
        });
        res.json(updatedTeaching);
    }catch(err){
        res.status(404).send("Teaching not found");
    }
});

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     NewTeaching:
 *       type: object
 *       properties:
 *         assistantId:
 *           type: string
 *           description: The assistant id of the teaching
 *           example: 03if84300308j84fj8f2s6
 *         courseId:
 *           type: string
 *           description: The course id of the teaching
 *           example: 8487f0g83584zfn376db7
 *     TeachingDetails:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The teaching's ID
 *               example: 0fjk3984wb30jfd4
 *             salary:
 *               type: double
 *               description: The assistant's salary per hour
 *               example: 24
 *             lastName:
 *               type: string
 *               description: The assistant's last name
 *               example: Dupond
 *             firstName:
 *               type: string
 *               description: The assistant's first name
 *               example: Marie
 *             absence:
 *               type: array
 *               items:
 *                 type: string
 *                 description: The ID of the absent child
 *                 example: 9eufn8038500328jdu3
 *               description: The list of IDs of the absent children
 *               example: [039r899z4hr8373fjnf, 937djjs38t4n500337v]
 *         - $ref: '#/components/schemas/NewTeaching'
 *         - $ref: '#/components/schemas/CourseDetails'     
 */

/**
 * @swagger
 * /teachings:
 *   get:
 *     summary: Retrieve a list of teachings
 *     description: Retrieve a list of teachings in the system
 *     tags:
 *       - teachings
 *     parameters:
 *       - in: query
 *         name: assistantName
 *         schema:
 *           type: string
 *         description: The name of the assistant to filter the result with
 *       - in: query
 *         name: courseTheme
 *         schema:
 *           type: string
 *         description: The theme of the course to filter the result with
 *       - in: query
 *         name: canton
 *         schema:
 *           type: string
 *         description: The name of the canton to filter the result with
 *       - in: query
 *         name: date
 *         schema:
 *           type: date
 *         description: The date to filter the result with
 *     responses:
 *       200:
 *         description: A list of teachings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TeachingDetails'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /teachings/{id}:
 *   get:
 *     summary: Retrieve a single teaching
 *     description: Retrieve a single teaching corresponding to the given id
 *     tags:
 *       - teachings
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the teaching to retrieve
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: A single teaching
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TeachingDetails'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /teachings:
 *   post:
 *     summary: Create a teaching
 *     description: Create a teaching 
 *     tags:
 *       - teachings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTeaching'
 *             required: 
 *                 - assistantId
 *                 - courseId
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TeachingDetails'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /teachings/{id}:
 *   delete:
 *     summary: Delete a teaching
 *     description: Delete a teaching corresponding to the given id
 *     tags:
 *       - teachings
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the teaching to delete
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
 * /teachings/{id}:
 *   patch:
 *     summary: Update a teaching
 *     description: Update a teaching corresponding to the given id
 *     tags:
 *       - teachings
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the teaching to patch
 *         schema: 
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTeaching'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */