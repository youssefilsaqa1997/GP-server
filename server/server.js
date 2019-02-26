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

const port = process.env.PORT || 4045;

var app = express();

app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send({
        massege: 'welcome to ilsaqa GP',
        apis: [{
            url: "https://secret-refuge-39928.herokuapp.com/loginToken",
            type: "post request",
            itTakes: { mobile: "01xxxxxxxxx", password: "main******" },
            itGive: {
                userObject: {
                    mobile: "010xxxxxxxx",
                    name: "folan",
                    id: "23rfewg4656t2qefgeti4534w2qe"
                }
            }
        }, {
            url: "https://secret-refuge-39928.herokuapp.com/signUp",
            type: "post request",
            itTakes: { mobile: "01xxxxxxxxx", password: "main******", name: "7amada", email: "7amada@tomail.com", typeOfUser: "user||owner" },
            itGive: "nothing"
        }, {
            url: "https://secret-refuge-39928.herokuapp.com/createPlace",
            type: "post request",
            itTakes: { owner_id: "sadfjweoifqmeoasl123e", name: "elgezira club", address: "8 elkamel mohamed ,zamalek", area: "zamalek", playGround: [] },
            itGive: "nothing"
        }, {
            url: "https://secret-refuge-39928.herokuapp.com/createschedual",
            type: "post request",
            itTakes: {
                place_id: "sadfjweoifqmeoasl123e", playGroundName: "field1", reserverName: "abutreka", hours: [1.2], reservedBy: "id", date: "1/1/2001", deposite: 20, reserverMobile: "010xxxxxxxx", typeOfReservation: {
                    type: "puplic",
                    neededPlayers: 1
                }
            },
            itGive: "nothing"
        }, {
            url: "https://secret-refuge-39928.herokuapp.com/scheduals",
            type: "post request",
            itTakes: { place_id: "sadfjweoifqmeoasl123e",playGroundName:"field1", date: "1/1/2001" },
            itGive: "free hours in the specific playground with the same date"
        }
        ]
    })
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
        area: req.body.area,
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
        User.findOne({ mobile: req.body.mobile }).then((userObject) => {
            bcrypt.compare(req.body.password, userObject.password, (err, Res) => {
                if (Res == true) {
                    if (userObject.typeOfUser == "owner") {
                        const token = userObject.generateAuthToken();
                        Place.find({ owner_id: userObject._id }).then((ownerPlaces) => {
                            res.header('x-auth', token).send({
                                owner: {
                                    mobile: userObject.mobile,
                                    name: userObject.name,
                                    id: userObject._id,
                                    places: ownerPlaces
                                }
                            });
                        }
                        ).catch((e) => {
                            res.status(400).send({ message: "there is no places yet to this owner" });
                        })
                    } else if (userObject.typeOfUser == "user") {
                        const token = userObject.generateAuthToken();
                        Place.find().then((allPlaces) => {
                            res.header('x-auth', token).send({
                                user: {
                                    mobile: userObject.mobile,
                                    name: userObject.name,
                                    id: userObject._id,
                                    places: allPlaces,
                                }
                            });
                        }).catch((e) => {
                            res.status(404).send({ message: "there is no places yet" });
                        })
                    }
                } else {
                    res.status(400).send({ message: "password doesn't match" });
                }

            })

        }).catch((e) => {
            res.status(404).send({ message: "mobile number not found" });
        })
    }
    else {
        res.status(400).send({ message: "The number less than or more 11" })
    }
})

app.post("/createschedual", (req, res) => {
    var schedual = new Schedual({
        place_id: req.body.place_id,
        playGroundName: req.body.playgroundname,
        reserverName: req.body.reserverName,
        hours: req.body.hours,
        reservedBy: req.body.reservedBy,
        date: req.body.date,
        deposite: req.body.deposite,
        reserverMobile: req.body.reservermobile,
        typeOfReservation: req.body.typeOfreservation
    });

    schedual.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    })
})

app.post("/scheduals", async (req, res) => {

    Place.findById(req.body.place_id).then((placeObject) => {
        var playGroundObject = placeObject.playGround.find((playGround) => playGround.name === req.body.playGroundName);
        var emptyHours = playGroundObject.avalibleHours;
        Schedual.find({ place_id: req.body.place_id, playGroundName: req.body.playGroundName, date: req.body.date }).then((scheduals) => {

            var closedHoursArray = []
            var closedHours = []
            for (i = 0; i < scheduals.length; i++) {
                closedHoursArray.push(scheduals[i].hours)
            }
            for (x = 0; x < closedHoursArray.length; x++) {
                closedHours = closedHours.concat(closedHoursArray[x]);
            }
            for (x = 0; x < closedHours.length; x++) {
                emptyHours = emptyHours.filter(hour => hour != closedHours[x])
            }
            res.send(emptyHours)
        })

    }).catch(e => res.send(e))
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