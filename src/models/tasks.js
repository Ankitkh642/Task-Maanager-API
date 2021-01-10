const mongoose=require('mongoose')
const validator=require('validator')

const TaskSchema=new mongoose.Schema({
    description: {
        type:String,
        required:true,
        trim:true
    },
    completed: {
        type:Boolean,
        default:false,
        trim:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectID,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})
const Task=mongoose.model('Task',TaskSchema)

module.exports=Task