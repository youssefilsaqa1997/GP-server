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
                place_id: "sadfjweoifqmeoasl123e", playGroundName: "field1", reserverName: "abutreka", hours: [1, 2], reservedBy: "id", date: "1/1/2001", deposite: 20, reserverMobile: "010xxxxxxxx", typeOfReservation: {
                    type: "puplic",
                    neededPlayers: 1,
                    playersJoined: []
                }
            },
            itGive: "object that saved in DB"
        }, {
            url: "https://secret-refuge-39928.herokuapp.com/freeHours",
            type: "post request",
            itTakes: { place_id: "sadfjweoifqmeoasl123e", playGroundName: "field1", date: "1/1/2001" },
            itGive: "free hours in specific playground with specific date"
        }, {
            url: "https://secret-refuge-39928.herokuapp.com/closedSlots",
            type: "post request",
            itTakes: { place_id: "sadfjweoifqmeoasl123e", playGroundName: "field1", date: "1/1/2001" },
            itGive: "all scheduals in specific playground with specific date"
        }, {
            url: "https://secret-refuge-39928.herokuapp.com/typeOfReservation",
            type: "post request",
            itTakes: { date: "1/1/2001", type: "public||private" },
            itGive: "all hours in specific date with the same type"
        },{
            url: "https://secret-refuge-39928.herokuapp.com/boolenHours",
            type: "post request",
            itTakes: { place_id: "sadfjweoifqmeoasl123e", playGroundName: "field1", date: "1/1/2001" },
            itGive: "avalible hours (Array of Objects) .each object have string , integer & boolen(to show if this hour booked or not) values"
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
        playGroundName: req.body.playGroundName,
        reserverName: req.body.reserverName,
        hours: req.body.hours,
        reservedBy: req.body.reservedBy,
        date: req.body.date,
        deposite: req.body.deposite,
        reserverMobile: req.body.reserverMobile,
        typeOfReservation: req.body.typeOfReservation
    });

    schedual.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    })
})

app.post("/freeHours", async (req, res) => {

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

app.post("/closedSlots", (req, res) => {

    Schedual.find({ place_id: req.body.place_id, playGroundName: req.body.playGroundName, date: req.body.date }).then((closedPlaces) => {
        res.send(closedPlaces)
    }).catch((e) => {
        res.statues(404).send({ massege: "No scheduals with this data", e })
    })


})

app.post("/typeOfReservation", (req, res) => {
    Schedual.find({ date: req.body.date }).then((scheduals) => {
        if (scheduals.length > 0) {
            let schedual = []
            for (i = 0; i < scheduals.length; i++) {
                if (scheduals[i].typeOfReservation.type === req.body.type) {
                    schedual.push(scheduals[i])
                }
            }
            if (schedual.length > 0) {
                res.send(schedual)
            } else {
                res.send({ massege: `no ${req.body.type} reservation yet on this date : ${req.body.date}` })
            }
        } else {
            res.send({ massege: `there is no reservation yet on this date : ${req.body.date}` })
        }
    }).catch((e) => {
        res.send(e)
    })
})

app.post("/boolenHours", (req, res) => {

    var fullHours = ["00:00 to 01:00", "01:00 to 02:00", "02:00 to 03:00", "03:00 to 04:00", "04:00 to 05:00", "05:00 to 06:00", "06:00 to 07:00", "07:00 to 08:00", "08:00 to 09:00", "09:00 to 10:00", "10:00 to 11:00", "11:00 to 12:00", "12:00 to 13:00", "13:00 to 14:00", "14:00 to 15:00", "15:00 to 16:00", "16:00 to 17:00", "17:00 to 18:00", "18:00 to 19:00", "19:00 to 20:00", "20:00 to 21:00", "21:00 to 22:00", "22:00 to 23:00", "23:00 to 00:00"];
    Place.findById(req.body.place_id).then((placeObject) => {
        var playGroundObject = placeObject.playGround.find((playGround) => playGround.name === req.body.playGroundName);
        var emptyHours = playGroundObject.avalibleHours;
        Schedual.find({ place_id: req.body.place_id, playGroundName: req.body.playGroundName, date: req.body.date }).then((scheduals) => {

            var closedHoursArray = []
            var closedHours = []
            var hoursObjects = []
            var templete = []
            for (i = 0; i < scheduals.length; i++) {
                closedHoursArray.push(scheduals[i].hours)
            }
            for (x = 0; x < closedHoursArray.length; x++) {
                closedHours = closedHours.concat(closedHoursArray[x]);
            }

            for (y = 0; y < emptyHours.length; y++) {
                for (h = 0; h < closedHours.length; h++) {
                    if (emptyHours[y] == closedHours[h] && templete.includes(emptyHours[y]) === false) {
                        hoursObjects.push({ "time": fullHours[emptyHours[y]], "isReserved": true, "value": emptyHours[y] })
                        templete.push(emptyHours[y])
                    } else if (templete.includes(emptyHours[y]) === false && closedHours.includes(emptyHours[y]) === false) {
                        hoursObjects.push({ "time": fullHours[emptyHours[y]], "isReserved": false, "value": emptyHours[y] })
                        templete.push(emptyHours[y])
                    }
                }
            }

            res.send(hoursObjects)
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