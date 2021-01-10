const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('../models/tasks')

const userSchema=new mongoose.Schema({
    name: {
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new error("Undefined Email")
            }
        }
    },
    age: {
        type:Number,
        default:0,
        validate(value){
            if(value<0)
            {
                throw new error("Enter positive value")
            }
        }
    },
    password: {
        type: String,
        trim:true,
        required:true,
        minlength : 7,
        validate(value){
            if(value.includes('password'))
            {
                throw new error("Wrong Password")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

//for relationship
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

//for hiding private
userSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()
     
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


//for auth token
userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=await jwt.sign({_id:user._id.toString()},process.env.JWT_TOKEN)  
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}


//for login
userSchema.statics.findByCredentials=async (email,password)=>{
    const user=await User.findOne({email})
    if(!user)
    throw new error('Unable to Login')

    const isTrue=await bcrypt.compare(password,user.password)
    if(!isTrue)
    throw new error('Unable to Login') 

    return user
}

// For hash password
userSchema.pre('save',async function(next){
    const user=this

    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }

    next()
})

//For deleting tasks
userSchema.pre('remove',async function(next){
    const user=this

    await Task.deleteMany({owner:user._id})

    next()
})

const User=mongoose.model('User',userSchema)

module.exports=User