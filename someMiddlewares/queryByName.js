const Person = require('../models/Person');

//Return the ids of the people filtered by name 
var QueryByName = async(query) => {
    const ifTwoNames = query.split(" ");
    try{
        //If we give both the first name and last name
        if(ifTwoNames.length == 2){ 
            const person2 = await Person.find({
                "$or": [{lastName: {"$regex": ifTwoNames[0], "$options": 'i'}},
                    {lastName: {"$regex": ifTwoNames[1], "$options": 'i'}},
                    {firstName: {"$regex": ifTwoNames[0], "$options": 'i'}},
                    {firstName: {"$regex": ifTwoNames[1], "$options": 'i'}}
                ]});
            return arrayIds(person2);
            
        //If we give either the first name or the last name
        }else{
            const person1 = await Person.find({
                "$or": [{lastName: {"$regex": query, "$options": 'i'}},
                    {firstName: {"$regex": query, "$options": 'i'}}
                ]});
            return arrayIds(person1);
        }
    }catch(err){
        return err;
    }
}

function arrayIds(person){
    arrayId = [];
    for (i=0; i<person.length; ++i){
        arrayId[i] = person[i]._id;         
    }
    return arrayId;
}

module.exports = QueryByName;