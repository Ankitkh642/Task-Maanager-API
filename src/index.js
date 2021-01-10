const express=require('express')
require('./db/mongoose')
const userRouter=require('./router/users')
const taskRouter=require('./router/task')

const app=express()
const port=process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log("Server started on port "+ port)
})

