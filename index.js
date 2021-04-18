const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x1vlg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const ServicesCollection = client.db("Refit").collection("Services");
    const OrderCollection = client.db("Refit").collection("Orders");
    const ReviewCollection = client.db("Refit").collection("Review");
    const AdminCollection = client.db("Refit").collection("Admin");

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        OrderCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/addReview', (req, res) => {
        const order = req.body;
        ReviewCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/dashboard/isAmin', (req, res) => {
        const email = req.body.email;
        AdminCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

    app.post('/dashboard/addadmin', (req, res) => {
        const order = req.body;
        AdminCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/services', (req, res) => {
        ServicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/reviews', (req, res) => {
        ReviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/orders', (req, res) => {
        OrderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addServices', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        ServicesCollection.insertOne({ title, description, price, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/dashboard/book/:_id', (req, res) => {
        const _id = ObjectID(req.params._id)
        ServicesCollection.findOne({ _id: _id })
            .then((result, err) => {
                res.json(result)
            })
    })

    app.patch('/updateOrderStatus', (req, res) => {
        const _id = ObjectID(req.body._id)
        OrderCollection.updateOne({ _id }, { $set: { status: req.body.status } })
        .then((result, err) => {
            res.json(result)
        })

    })


    console.log("db connected successfully");
});


app.listen(port, () => {
    console.log(`listinisg on port ${port}`);
})