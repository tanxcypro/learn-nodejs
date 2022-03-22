const express= require('express')

const bcrypt=require('bcrypt')
const session=require('express-session')
const cookieParser=require('cookie-parser')
const flash=require('connect-flash')
const moment = require('moment');

const upload = require('./middlewares/uploadFile')
const db=require('./connect/db')
 
const app=express()
const port=process.env.PORT||5000

let isLogin=true
// let blogs=[{

//         id:1,
//         title: "title",
//         content:"kkkkksjwhwhhwhwhw",
//         post_at:"1605",
//         author:'afif munajat'

// }]

app.set('view engine','hbs')

app.use('/public',express.static(__dirname+'/public'))
app.use('/uploads',express.static(__dirname+'/uploads'))
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






const month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'Desember'
]

 app.get('/',function(req,res){
     res.send("hello world")
 })
 app.get('/index',function(req,res){
    
     
    let query=`SELECT tb_project1.id, name, start_date,end_date, description,technologies,tb_user.nama, image, author_id
	FROM tb_project1
	LEFT JOIN tb_user
		ON tb_project1.author_id=tb_user.id  ORDER BY id DESC`
     db.connect(function(err,client,done){
         if(err)throw err
         client.query(query,function(err,result){
             done()
             let data=result.rows
             let dataBlogs=data.map(function(data){
                return{
                    ...data,
                    isLogin:isLogin,
                    post_At:getFullTime(new Date()),
                    user:req.session.user,
                    isLogin:req.session.isLogin
                  
                   
                    
                }

                })
                let sukses=req.flash('success')
               
                // for(let i=0;i<data.length;i++){
                //     let node=data[i].technologies

                //     for(let i=0;i<node.length;i++){
                //         let node_a =node[i]
                //        console.log(node_a);
                    // }

                //     if (node==true){
                      
                //     }
                    let node=data[0].technologies[0]
                    let react=data[1].technologies[1]
                    let type=data[2].technologies[2]
                    let jquery=data[3].technologies[3]
                   
               
                // }
               
               
               
                console.log(react,node,type,jquery);

                 
                 
               
            
                res.render('index',{
                    isLogin:req.session.isLogin,
                   tb_project1:dataBlogs,
                user:req.session.user,
                sukses:sukses,type,react,node,jquery
               
            })
             
         
    
        
        
    
    
        })
    })
 })
 
app.get("/contact",function(req,res){
    res.render('contact')
})
app.get('/add-project',function(req,res){
    if (!req.session.isLogin) {
        res.redirect('/index')
    }

   
    res.render('add-project')
})
app.get('/update/:id', function(req, res) {

    let id = req.params.id;
    db.connect(function(err,client,done){
        if(err)throw err
        client.query(`SELECT*FROM tb_project1 WHERE id=${id}`,function(err,result){
            if(err)throw err
            let data=result.rows[0]

            data={
                ...data,
                start_date: renderDate(data.start_date),
                end_date: renderDate(data.end_date),
               

            }
           
               
               
              
              
              
               console.log(data);
             
       
              
               res.render('update', { 
                                    tb_project1:data}) 
           })
        })
   
 })
 
app.post('/update/:id', upload.single('image'),function(req,res){
    let id=req.params.id
 
  let technologies=req.body.technologies
  
  let techno=technologies

  const { name,start_date,end_date, description} = req.body
  let data = {
    name:name,
    start_date,
    end_date,
    description,
    technologies,
    image: req.file.filename,
   
}

    db.connect(function(err,client,done){
        if(err)throw err
        client.query(`UPDATE tb_project1
        SET name='${data.name}', description='${data.description}', technologies='${data.technologies}', image='${data.image}', start_date='${data.start_date}', end_date='${data.end_date}'
        WHERE id=${id}`,function(err,result){
            if(err)throw err
            let data=result.rows[0]
           
               
               
               console.log(data)
               res.redirect('/index')
           })
        })
   
    })
    
app.post('/add-project', upload.single('image'), function (req, res) {
   
   let technologies=req.body.technologies
   let techno='{'+technologies+'}'
const { name,start_date,end_date, description} = req.body
       
let data = {
    name:name,
    start_date,
    end_date,
    description,
    techno,
    image: req.file.filename,
    author_id: req.session.user.id
}
 
console.log(data)
    let query=`INSERT INTO tb_project1(
         name,start_date,end_date,description,image,technologies)
        VALUES ( '${data.name}','${data.start_date}','${data.end_date}','${data.description}','${data.image}','${data.techno}')`
       
      
    db.connect(function(err,client,done){
        if(err)throw err
        client.query(query,function(err,result){
            if(err)throw err
            
            console.log(data)
            res.redirect('/index')
        })
    })
})
    
app.get('/delete-blog/:id',function(req,res){
    
    let id=req.params.id

    
    db.connect(function(err,client,done){ 
       
        if(err)throw err
       
        client.query(`DELETE FROM tb_project1 WHERE id=${id}`,function(err,result){
            if(err)throw err
            res.redirect('/index')

            });
    });
    
    
})

app.get('/login',function(req,res){
    let danger=req.flash('danger')
    console.log(danger)
            res.render('login',{
                user:req.session.user,
                danger:danger
            })
})

app.post('/login',function(req,res){
    const{email,password}=req.body
    let query=`SELECT*FROM tb_user WHERE email='${email}'`
   
    db.connect(function(err,client,done){
        if(err) throw err

       

        client.query(query,function(err,result){
            if(err)throw err
            done()
            
            if (err) throw err
           
            if (result.rowCount == 0) {
                req.flash('danger', 'email and password doesnt match')
                return res.redirect('/login')
            }

            let isMatch = bcrypt.compareSync(password, result.rows[0].password)
           
           
            
            console.log(isMatch)
            if(isMatch){
                req.session.isLogin=true
                req.session.user={
                    id:result.rows[0].id,
                    email:result.rows[0].email,
                    nama:result.rows[0].nama,
                    
                }
                
                req.flash('success','login succes')
                res.redirect('/index')
            
            }else{
                req.flash('danger','email dan password salah')

                res.redirect('/login')
            }
            
        })

    })
   
    
   




})

app.get('/register',function(req,res){

res.render('register')
})

app.post('/register',function(req,res){

    const data=req.body
    let hashedPassword=bcrypt.hashSync(data.password,10)
    let query=`INSERT INTO tb1(
        nama, email, password)
    VALUES('${data.nama}','${data.email}','${hashedPassword}')`

    db.connect(function(err,client,done){
        if(err)throw err
        client.query(query,function(err,result){
            if(err)throw err
            res.redirect('/login')
        })
    })

  
})


app.get('/detail/:id',function(req,res){

      
    let id=req.params.id
 
   
    db.connect(function(err,client,done){
       if(err)throw err
       client.query(`SELECT*FROM tb_project1 WHERE id=${id}`,function(err,result){
           if(err)throw err
           let data=result.rows[0]
        //    let dataBlogs=data.map(function(data){
        //     return{
        //         ...data,
                
        // 
               
                
        //     }

        //     })
        
        
        let start_date= renderDate(new Date(data.start_date))
        let end_date= renderDate(new Date(data.end_date))
        // let hasil=getDistanceTime(new Date(data.start_date))
         let techno=data.technologies
         for(let i=0;i<techno.length;i++){
             let box=techno[i]
             console.log(box);
         }
        
        console.log(techno);
        
//         techno.forEach(myFunction);


 
// function myFunction(data) {
// data

// }

              
              res.render('detail', { id: id ,tb_project1:data,start_date,end_date}) 
          })
       })

})

app.get('/logout', function (req, res) {
    req.session.destroy()
    res.redirect('/index')
})




 app.listen(port,function(){
    console.log(`server starting on Port:${port}`)
 })
 function getFullTime(time) {

    const date = time.getDate()
    const monthIndex = time.getMonth()
    const year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    if (hours < 10) {
        hours = `0${hours}`
    }

    if (minutes < 10) {
        minutes = `0${minutes}`
    }

    return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
}

function renderDate(time) {

    let hari = [
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"
    ]

    let bulan = [
        "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
    ]

    let date = time.getDate();
    let monthIndex = time.getMonth();
    let year = time.getFullYear();

    let fullTime = `${year}-${bulan[monthIndex]}-${hari[date]}`;

    return fullTime;
}

