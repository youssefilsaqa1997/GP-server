var express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

var { User } = require('./models/user');
var { Place } = require('./models/place');
var { Schedual } = require('./models/schedual');
var { mongoose } = require('./DB/mongoose');

const port = process.env.PORT || 3000;

var app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    res.send({massege:'welcome to ilsaqa GP'})
})
app.post('/signUp', (req, res) => {
    if (req.body.mobile.length == 11) {

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                var user = new User({
                    mobile: req.body.mobile,
                    password: hash,
                    name: req.body.name,
                    email: req.body.email,
                    typeOfUser: req.body.typeOfUser
                });

                user.save().then((doc) => {
                    res.send(doc);
                }, (e) => {
                    res.status(400).send(e);
                })
            })
        })


    } else {
        res.status(400).send({ massege: "mobile number less or more than 11 number" });
    }
});

app.post('/createPlace', (req, res) => {

    var place = new Place({
        owner_id: req.body.owner_id,
        name: req.body.name,
        address: req.body.address,
        location: req.body.location,
        playGround: req.body.playGround
    });

    place.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    })

});

app.post('/loginToken', (req, res) => {
    if (req.body.mobile.length == 11) {
        User.findOne({ mobile: req.body.mobile }).then((doc) => {
            bcrypt.compare(req.body.password, doc.password, (err, Res) => {
                if (Res == true) {
                    const token = doc.generateAuthToken();
                    Place.find({ owner_id: doc._id }).then((doc2) => {
                            res.header('x-auth',token).send({
                                owner: {
                                    mobile: doc.mobile,
                                    name: doc.name,
                                    id: doc._id,
                                    places: doc2
                                }
                            });
                        } 
                    ).catch((e) => {
                        res.status(400).send({ message: "there is no places yet to this owner" });
                    })
                } else {
                    res.status(400).send({ message: "password doesn't match" });
                }

            })

        }).catch((e) => {
            res.status(400).send({ message: "mobile number not found" });
        })
    }
    else {
        res.status(400).send({ message: "The number less than or more 11" })
    }
})

app.post("/createschedual", (req, res) => {
    var schedual = new Schedual({
        place_id: req.body.place_id,
        playgroundname: req.body.playgroundname,
        reserverName: req.body.reserverName,
        hours: req.body.hours,
        reservedBy: req.body.reservedBy,
        date: req.body.date,
        deposite: req.body.deposite,
        reservermobile: req.body.reservermobile
    });

    schedual.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    })
})

app.post("/scheduals", (req, res) => {
    Schedual.find({place_id:req.body.place_id ,date:req.body.date}).then((doc) => {
        res.send(doc)
    })
})


app.listen(port, () => {
    console.log(`startes on port ${port}`)
});

// var data={
//     id:10
// }

// var token = jwt.sign(data, 'ilsaqa');
// console.log(token);

// var decoded=jwt.verify(token,'ilsaqa')
// console.log(decoded)