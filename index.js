const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true,
}));
app.use(express.json())
app.use(cookieParser())





// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qlvqjvw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carDoctor').collection('carDoctor');
    const BookingCollection = client.db('carDoctor').collection('booking');

    // auth related api or jwt
    app.post("/jwt", async(req, res) =>{
      const user = req.body;
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
      res
      .cookie('token', token, {
        httpOnly:true,
        secure:false,
        // sameSite:"none"
      })
      
      .send({success: true})

    })



    // services related api load
//     all data read
    app.get("/services", async(req,res) =>{
       const cursor = serviceCollection.find();
       const result = await cursor.toArray()
       res.send(result)
       // console.log(result)
    }
    )

//     singleData
app.get("/services/:id", async(req, res) =>{
       const id = req.params.id;
       const query = {_id: new ObjectId(id)}

       const option = {
              projection:{title:1, price:1, img:1, service_id:1}
       }

       const result = await serviceCollection.findOne(query, option)
       res.send(result)

})

// booking

app.get("/booking", async(req,res) =>{

  console.log(req.query.email)
    console.log("tok tok token", req.cookies.token)
  let query = {};

  if(req.query?.email){
    query = {Email: req.query.email}
  }

       const cursor = BookingCollection.find(query);
       const result = await cursor.toArray()
           console.log(result)
       res.send(result)
   
    }
    )


app.post("/booking", async (req, res) => {
      const booking = req.body;
        console.log(booking);
      const result = await BookingCollection.insertOne(booking);
      console.log(result);
      res.send(result);
    });

    // delete
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      console.log("delete", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await BookingCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);





app.get("/", (req, res) => {
  res.send("car-doctor is running...");
});



app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});

