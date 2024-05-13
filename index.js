const express = require('express');
const mongoose = require('mongoose')
const app = express();
const port = 3000;

const teamRoutes = require('./routes/teamRoutes');
const resultRoutes = require('./routes/resultRoutes');
const teamResultRoutes = require('./routes/teamResultRoutes');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbUrl = "mongodb://localhost:27017/fantasy";

const connectionParams = {
  useNewUrlParser : true,
  useUnifiedTopology : true
}

mongoose.connect(dbUrl, connectionParams).then(() => {
  console.info("connected to db")
}).catch((e) => {
  console.log("Error:", e);
})

app.use(teamRoutes);
app.use(resultRoutes);
app.use(teamResultRoutes);

// const UserSchema = mongoose.Schema({
//   level : String
// })

// const userModel = mongoose.model("logger", UserSchema)

// async function run() {
//   try {
//     // console.log('hello')
//     // await client.connect();
//     // console.log('hellos')
//     // await client.db("admin").command({ ping: 1 });

//     // db = client.db(DB_NAME);

    
//     console.log("You successfully connected to MongoDB!");
    
//   } finally {
//     console.log("Finally to MongoDB!");
//   }
// }

// app.get('/users', (req, res) => {
//   console.log(userModel)
//   userModel.find({}).then(function(users){
//     console.log(users)
//     res.json(users)
//   }).catch(function(err){
//     console.log(err)
//   })
// })

// // Sample create document
// async function sampleCreate() {
//   const demo_doc = { 
//     "demo": "doc demo",
//     "hello": "world"
//   };
//   // const demo_create = await db.collection(DB_COLLECTION_NAME).insertOne(demo_doc);
  
//   console.log("Added!")
//   // console.log(demo_create.insertedId);
// }


// Endpoints

app.get('/', async (req, res) => {
  res.send('Hellos World!');
});

// app.get('/demo', async (req, res) => {
//   await sampleCreate();
//   res.send({status: 1, message: "demo"});
// });


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// run();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});