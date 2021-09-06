const express = require('express');     
const app = express();               
const mongoose = require('mongoose');
const cors = require('cors');

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = {
  openapi: '3.0.0',
  info:{
    title: 'Extracurricular courses',
    version: '1.0.0',
    description: 'This is a REST API application made with Node.js, Express.js and MongoDB and documented with Swagger'
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Development server'
    }
  ]
}; 
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],  //Paths to the API docs. File paths should be relative to the root directory
};
const swaggerSpec = swaggerJSDoc(options);   //Generate the OpenAPI documentation with the given options


//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myDB',
{ useNewUrlParser: true, 
  useUnifiedTopology: true });

//To check if it's working
var db = mongoose.connection;  
db.on('open', () => {console.log('Connected to myDB')});
db.on('error', (error) => {console.error.bind(console, 'MongoDB connection error:')});

//Import routes
const peopleRoute = require('./routes/people');
const cantonsRoute = require('./routes/cantons');
const classesRoute = require ('./routes/classes');
const assistantsRoute = require('./routes/assistants');
const childrenRoute = require('./routes/children');
const themesRoute = require('./routes/themes');
const coursesRoute = require('./routes/courses');
const teachingsRoute = require('./routes/teachings');

//Create route (page)
app.get('/', (req, res) => {   
    res.send('We are on home');
});

//Middlewares
app.use(express.json());      //bodyparser equivalent
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/people', peopleRoute);
app.use('/cantons', cantonsRoute);
app.use('/classes', classesRoute);
app.use('/assistants', assistantsRoute);
app.use('/children', childrenRoute);
app.use('/themes', themesRoute);
app.use('/courses', coursesRoute);
app.use('/teachings', teachingsRoute);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Start listening to the server
app.listen(8000, () => {
  console.log("App listening on port 8000")
}); 
