const Course = require('../models/Course');

//Return the ids of the courses filtered by date 
var QueryByDate = async(query) => {
    try{
        //Find courses by the given date
        const courses = await Course.find({date: query});
        
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

module.exports = QueryByDate;