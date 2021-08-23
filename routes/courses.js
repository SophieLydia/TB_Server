const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Person = require('../models/Person');
const QueryByTheme = require('../someMiddlewares/queryByTheme');
const QueryByCantonClasses = require('../someMiddlewares/queryByCantonClasses');
const mongoose = require('mongoose');

//Get all the courses that match the given fields 
//filter on title of the theme, canton of the class and/or date
router.get('/', async (req, res) => {     
    try{
        const courses = await Course.find({
            "$and": [
                req.query.themeTitle ? {"themeId":  {"$in": await QueryByTheme(req.query.themeTitle)}} : {},
                req.query.classCanton ? {"classId": {"$in": await QueryByCantonClasses(req.query.classCanton)}} : {},
                req.query.date ? {"date": req.query.date} : {}
            ]
        }).populate({path: "themeId", select: "title"})
        .populate({path: "classId", select: "periode", populate:{path: "cantonId", select: "name"}})
        .select({"date": 1, "_id":1});
        res.json(courses);
    }catch(err){
        res.status(404).send("Courses not found");
    }
});

//Get a specific course by id
router.get('/:id', async (req, res) => {      
    try{
        const course = await Course.findById(req.params.id);
        res.json(course);
    }catch(err){
        res.status(404).send("Cours not found");
    }
});

//Submit a course
router.post('/', async (req, res) => {
    const course = new Course({
        themeId: req.body.themeId,
        classId: req.body.classId,
        date: req.body.date,
        cost: req.body.cost,
        absence: req.body.absence
    });
    try{
        const savedCourse = await course.save();
        if(req.body.absence != undefined){
            for(var i=0; i< req.body.absence.length; ++i){
                child = await Person.findById(req.body.absence[i]);
                if(child.role != "child"){
                    console.log("The person number " + (i+1) + " is not a child");
                    savedCourse = await Assistant.deleteOne({_id: req.body._id});
                    throw new Error ("role");
                }
            }
        }
        res.status(201);
        res.json(savedCourse);
    }catch(err){
        var message = "";
        if(err instanceof mongoose.Error.ValidationError){
            for(field in err.errors){
                switch(err.errors[field].path){
                    case "themeId":
                        message += "Theme not found";
                        break;
                    case "classId":
                        if(message != ""){
                            message += " and class not found";
                        }else{
                            message += "Class not found";
                        }
                        break;
                    case "absence":
                        if(message != ""){
                            message += " and child for absence not found";
                        }else{
                            message += "Child for absence not found";
                        }
                        break;
                }
            }
        }
        if(message != ""){
            res.status(404).send(message);
        }else if(err = "role"){
            res.status(400).send("Role of one or more people for absence is not child");
        }else{
            res.status(400).send("Bad request");
        }
    }
});

//Delete a specific course by id
router.delete('/:id', async (req, res) => {
    try{
        const removedCourse = await Course.deleteOne({_id: req.params.id});
        res.json(removedCourse);
    }catch(err){
        res.status(404).send("Cours not found");
    }
});

//Update a specific course by id
router.patch('/:id', async (req, res) => {
    try{
        const updatedCourse = await Course.updateOne(
            {_id: req.params.id},
            {$set: req.body
        });
        res.json(updatedCourse);
    }catch(err){
        res.status(404).send("Cours not found");
    }
});

module.exports = router;


/**
 * @swagger
 * components:
 *   schemas:
 *     NewCourse:
 *       type: object
 *       properties:
 *         themeId:
 *           type: string
 *           description: The theme id of the course
 *           example: 03if84300308j84fj8f2s6
 *         classId:
 *           type: string
 *           description: The class id of the course
 *           example: 8487f0g83584zfn376db7
 *         date:
 *           type: date
 *           description: The date on which the course takes place
 *           example: 2021-02-21
 *         cost:
 *           type: double
 *           description: The cost of the course, i.e. food for the break
 *           example: 23.50
 *         absence:
 *           type: array
 *           items:
 *             type: string
 *             description: The ID of the absent child
 *             example: 9eufn8038500328jdu3
 *           description: The list of IDs of the absent children
 *           example: [039r899z4hr8373fjnf, 937djjs38t4n500337v]
 *     Course:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The course's ID
 *               example: 0fjk3984wb30jfd4
 *         - $ref: '#/components/schemas/NewCourse'    
      
 *     CourseDetails:
 *       allOf:
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The course's ID
 *               example: 0fjk3984wb30jfd4
 *             themeId:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the theme
 *                   example: f9j0wehf8g8gf9we9f
 *                 title:
 *                   type: string
 *                   description: The title of them theme
 *                   example: "What is a computer?"
 *             date:
 *               type: string
 *               description: The date on which the course is given
 *             classId:
 *               type: string
 *               description: The ID of the class
 *               example: jabfhigf89vw2b03edw
 *         - $ref: '#/components/schemas/ClassDetails'    
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Retrieve a list of courses
 *     description: Retrieve a list of courses in the system
 *     tags:
 *       - courses
 *     parameters:
 *       - in: query
 *         name: themeTitle
 *         schema:
 *           type: string
 *         description: The title of the theme to filter the result with
 *       - in: query
 *         name: classCanton
 *         schema:
 *           type: string
 *         description: The canton of the class to filter the result with
 *       - in: query
 *         name: date
 *         schema:
 *           type: date
 *         description: The date to filter the result with
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseDetails'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Retrieve a single course
 *     description: Retrieve a single course corresponding to the given id
 *     tags:
 *       - courses
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the course to retrieve
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: A single course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a course
 *     description: Create a course 
 *     tags:
 *       - courses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCourse'
 *             required: 
 *                 - themeId
 *                 - classId
 *                 - date
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/CourseDetails'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     description: Delete a course corresponding to the given id
 *     tags:
 *       - courses
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the course to delete
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
 * /courses/{id}:
 *   patch:
 *     summary: Update a course
 *     description: Update a course corresponding to the given id
 *     tags:
 *       - courses
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         description: Id of the course to patch
 *         schema: 
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewCourse'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */