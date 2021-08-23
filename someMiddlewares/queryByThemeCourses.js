const Course = require('../models/Course');
const QueryByTheme = require('../someMiddlewares/queryByTheme');

//Return the ids of the courses filtered by the title of theme
var QueryByThemeCourses = async(query) => {
    try {
        //Find the ids of the theme by the given title
        const themeIds = await QueryByTheme(query);

        //Find courses 
        const courses = await Course.find({themeId: {"$in": themeIds}});

        //Get the ids of courses
        var arrayId = [];
        for (i=0; i<courses.length; ++i){
            arrayId[i] = courses[i]._id;         
        }

        return arrayId;
    }catch(err){
        return err;
    }
}

module.exports = QueryByThemeCourses;