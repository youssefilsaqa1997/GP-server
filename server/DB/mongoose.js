var mongoose = require('mongoose')

mongoose.Promise =global.Promise;
mongoose.connect('mongodb://ilsaqa1997:mainmethod1@ds117834.mlab.com:17834/gp', { useNewUrlParser: true })

module.exports={mongoose};
