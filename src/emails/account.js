const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'ankitkh642@outlook.com',
        subject:'Welcome to Task Manager',
        text:'Hello '+name+' Welcome to Task Manager'
    }).then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.error('Not sent')
    })
}

const sendCancelEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'ankitkh642@outlook.com',
        subject:'Bi Bi to Task Manager',
        text:'Please '+name+' dont say Bi Bi to Task Manager'
    }).then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.error('Not sent')
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancelEmail
}