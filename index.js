const express= require('express')

const bcrypt=require('bcrypt')
const session=require('express-session')
const cookieParser=require('cookie-parser')
const flash=require('connect-flash')


const db=require('./connect/db')
 
const app=express()
const port=5000

let islogin=true
let blogs=[{

        id:1,
        title: "title",
        content:"kkkkksjwhwhhwhwhw",
        post_at:"1605",
        author:'afif munajat'

}]

app.set('view engine','hbs')

app.use('/public',express.static(__dirname+'/public'))
app.use('/upload',express.static(__dirname+'/uploads'))
app.use(express.urlencoded({extended:false}))
app.use(cookieParser('SecretStingForSession'))
app.use(session({
        cookie: {
            maxAge: 2 * 60 * 60 * 1000,
            secure: false,
            httpOnly: true
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: "secretValue"
    })
)
app.use(flash())

const isLogin=false

 app.get('/',function(req,res){
     res.send("hello world")
 })
 app.get("/add-project",function(req,res){
     res.render('add-project')
 })
 app.get("/contact",function(req,res){
    res.render('contact')
})
app.get('/index',function(req,res){
    res.render('index')
})


 app.listen(port,function(){
    console.log(`server starting on Port:${port}`)
 })
 