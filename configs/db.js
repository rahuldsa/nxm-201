const mongoose=require('mongoose')
const connection=mongoose.connect('mongodb+srv://rahul:rahul@cluster0.qq9z6nz.mongodb.net/nxm201ev?retryWrites=true&w=majority')

module.exports={connection}