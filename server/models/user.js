const mongoose = require('mongoose')
const validator=require('validator')
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var OwnerSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true
  },
  email:{
    type:String,
    required:true,
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:true,
    minlength:3
  },
  mobile:{
    type:String,
    required:true,
    minlength:11,
    trim:true,
    unique:true
  },
  typeOfUser:{
    type:String,
    required:true,
    trim:true
  }
});

OwnerSchema.methods.generateAuthToken = function () {
    var owner = this;
    var access = 'auth';
    var token = jwt.sign({_id: owner._id.toHexString(), access}, 'ilsaqa', {expiresIn: "120 days" }).toString();
    return token;
  };

var User = mongoose.model('users', OwnerSchema);

module.exports={
  User
}