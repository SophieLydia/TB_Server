const Canton = require('../models/Canton');
const Cours = require('../models/Course');
const QueryByCantonClasses = require('../someMiddlewares/queryByCantonClasses');

//Return the ids of the courses filtered by the name of cantons
var QueryByCantonCourses = async(query) => {
    try {
        //Find cantons by the given name
        const cantons = await Canton.find({name: query});

        //Get the ids of cantons
        var arrayId = [];
        for (i=0; i<cantons.length; ++i){
            arrayId[i] = cantons[i]._id;         
        }
        const classIds = await QueryByCantonClasses(arrayId);
        const courses = await Cours.find({classId: {"$in": classIds}});
        var coursIds = [];
        for (i=0; i<courses.length; ++i){
            coursIds[i] = courses[i]._id;
        }
        return coursIds;
    }catch(err){
        return err;
    }
}

module.exports = QueryByCantonCourses;