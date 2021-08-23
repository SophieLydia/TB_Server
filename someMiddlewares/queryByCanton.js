const Assistant = require('../models/Assistant');
const Child = require('../models/Child');
const Canton = require('../models/Canton');
const QueryByCantonClasses = require('./queryByCantonClasses');

//Return the ids of the people filtered by the name of cantons
var QueryByCanton =  async(query) => {
    try{
        //Find cantons by the given name
        const cantons = await Canton.find({name: query});
        
        //Get the ids of cantons
        var arrayId = [];
        for (i=0; i<cantons.length; ++i){
            arrayId[i] = cantons[i]._id;         
        }

        //Find the corresponding assistants and children
        const assistant = await Assistant.find({cantonId: {"$in": arrayId}}); 
        const classIds = await QueryByCantonClasses(arrayId);
        const child = await Child.find({classId: {"$in": classIds}}); 

        //Get the corresponding ids
        var finalIds = [];
        for (i=0; i<assistant.length; ++i){
            finalIds[i] = assistant[i]._id;
        }
        for(i=0; i<child.length; ++i)
            finalIds[i+assistant.length] = child[i]._id;
        return finalIds;
    }catch(err){
        return err;
    }
}

module.exports = QueryByCanton;