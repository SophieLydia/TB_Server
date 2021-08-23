const Child = require('../models/Child');
const Class = require('../models/Class');

//Return the ids of the children filtered by the periode of class
var QueryByClassChildren =  async(query) => {
    try{
        //We find classes by the given periode
        const classes = await Class.find({periode: query});
        
        //We get the ids of classes
        var arrayId = [];
        for (i=0; i<classes.length; ++i){
            arrayId[i] = classes[i]._id;         
        }
        //We find the corresponding children
        const children = await Child.find({classId: {"$in": arrayId}});  
        
        //Get all the corresponding ids
        var finalIds = [];
        for (i=0; i<children.length; ++i){
            finalIds[i] = children[i]._id;         
        }   
        return finalIds;
    }catch(err){
        return err;
    }
}

module.exports = QueryByClassChildren;