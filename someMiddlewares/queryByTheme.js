const Theme = require('../models/Theme');

//Return the ids of the themes filtered by the title
var QueryByTheme =  async(query) => {
    try{
        //Find themes by the given title
        const themes = await Theme.find({"title":  {"$regex": query}});

        //Get the ids of themes
        var arrayId = [];
        for (i=0; i<themes.length; ++i){
            arrayId[i] = themes[i]._id;         
        }
        
        return arrayId;
    }catch(err){
        return err;
    }
}

module.exports = QueryByTheme;