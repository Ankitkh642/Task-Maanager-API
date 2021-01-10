const express=require('express')
const User=require('../models/users')
const auth=require('../middleware/auth')
const router=new express.Router()
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail,sendCancelEmail}=require('../emails/account')

router.post("/users",async (req,res)=>{
    const user=new User(req.body)
    try {
        sendWelcomeEmail(user.email,user.name)
        await user.save()
        const token=await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login',async (req,res)=>{
    try {
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        res.send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

const avatar=multer({
    limits:{
        fileSize:1048576
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            cb(new Error('You have entered a wrong format'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,avatar.single('avatar'),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user=await User.findById(req.params.id)
        if(!user  || !user.avatar)
        {
            throw new Error('No avatar found')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()        
    }
})

router.patch('/users/me',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','age','email','password']
    const isValid=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValid)
    {
        return res.status(400).send('You are entering wrong parameter')
    }
    // const _id=req.user._id
    try {
        // const user=await User.findById(_id)
        updates.forEach((update)=>{
            req.user[update]=req.body[update] 
        })
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try {
        sendCancelEmail(req.user.email,req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

module.exports=router