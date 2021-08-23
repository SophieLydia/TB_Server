const Class = require('../models/Class');

//Return the ids of the classes filtered by the ids of cantons
var QueryByCantonClasses = async(query) => {
    try {
        const classes = await Class.find({cantonId: {"$in": query}});
        var classIds = [];
        for (i=0; i<classes.length; ++i){
            classIds[i] = classes[i]._id;
        }
        return classIds;
    }catch(err){
        return err;
    }
}

module.exports = QueryByCantonClasses;