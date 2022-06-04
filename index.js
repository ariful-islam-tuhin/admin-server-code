const express = require('express');
const { MongoClient } = require('mongodb');

const cors = require("cors");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 9000
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d4i3w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



async function run() {
  try {
    await client.connect();
    //   console.log("connected to database")  
    const database = client.db('admin-dashboard');
    const servicesCollection = database.collection('services')
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");

    // post API
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.json(result);
    });

    // get api
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // add orders api
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
    // Get Single Service
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    //user post route      
    app.post('/users', async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    // put upsert user because of google signin
    app.put('/users', async (req, res) => {
      const user = req.body;
      // console.log('put', user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    // put api for creating admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // get api for admin panel
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      console.log(user);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const order = await cursor.toArray();
      res.send(order);
    });
    
  




  }
  finally {

  }
}

run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("admin panal server is  running");
});

app.listen(port, () => {
  console.log(`Example decoration app listening at http://localhost:${port}`);
});