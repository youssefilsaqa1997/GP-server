const mongoose = require('mongoose')

var SchedualSchema = new mongoose.Schema({
  place_id:{
    type:String,
    required:true,
    trim:true
  },
  playgroundname:{
    type:String,
    required:true,
    trim:true
  },
  reserverName:{
    type:String,
    required:true,
    trim:true
  },
  hours:{
    type:Array,
    required:true,
    trim:true
  },
  reservedBy:{
    type:String,
    required:true,
    trim:true
  },
  date:{
    type:String,
    required:true,
    trim:true
  },
  deposite:{
    type:Number,
    required:true,
    trim:true
  },
  reservermobile:{
    type:String,
    required:true,
    minlength:11,
    trim:true,
  },
  typeOfreservation:{
    type:Object,
    required:true
  }
});


var Schedual = mongoose.model('Schedual', SchedualSchema);

module.exports={
    Schedual
}