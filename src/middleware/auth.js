const jwt=require('jsonwebtoken')
const User=require('../models/users')

const auth=async function(req,res,next){
    try {
        const token=await req.header('Authorization').replace('Bearer ','')
        const decoded=await jwt.verify(token,process.env.JWT_TOKEN)
        const user=await User.findOne({_id:decoded._id,'tokens.token':token})
        if(!user)
        throw new Error()

        req.user=user
        req.token=token
        next()
    } catch (e) {
        res.status(400).send({error:'Not authenticated'})
    }
}

module.exports=auth