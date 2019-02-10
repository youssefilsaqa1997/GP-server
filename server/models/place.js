const mongoose = require('mongoose')

var PlaceSchema = new mongoose.Schema({
  owner_id:{
    type:String,
    required:true,
    trim:true
  },
  name:{
    type:String,
    required:true,
    trim:true
  },
  address:{
    type:String,
    required:true,
    trim:true
  },
  area:{
    type:String,
    required:true
  },
  rate:{
    type:Array
  },
  playGround:{
    type:Array,
    required:true,
  }
});

var Place = mongoose.model('Place', PlaceSchema);

module.exports={
    Place
}