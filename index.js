const exp = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    fs = require('fs'),
    // cookie-parser:cookie解析
    cookieParser = require('cookie-parser')

const app = exp()

app.use(exp.static('static'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

//multer是express的一个中间件，可以处理通过form表单上传的数据
//textField的内容会转化之后，会保存在body对象中
//文件内容转化后会在file或者files对象中

//通过multer中间件进行文件的磁盘存储
//para1:文件存储在哪个文件夹
//para2:文件名 (以用户名为名称)
//每次请求的时候，请求头中会自动添加现有cookie
//所以只需要从请求的cookie中取出petname即可
const storage = multer.diskStorage({
  destination: 'static/upload',
  filename: function (req, file, callback) {
    callback(null, req.cookies.petname + '.jpg')
  }
})
//根据配置好的存储设置，调用multer方法，生成一个对象
const upload = multer({ storage: storage })

/*-------------注册---------------*/
app.post('/register',(req,res) =>{
    const petname = req.body.petname
    const filePath = 'users/' + petname + '.txt'
    
    function saveFile(){
        //判断用户名是否存在
        fs.exists(filePath,exists=>{
            if(exists) res.json({'result':'0','message':'用户已存在,注册失败'})
            else{
                //不存在
                //新建文件，保存用户注册数据
                fs.appendFile(filePath,JSON.stringify(req.body),err=>{
                        if(err) res.json({'result':'0','message':'系统出错，请再次尝试...'})
                        else res.json({'result':'1','message':'注册成功！'})  
                })
            }
        })
    }

    //文件夹是否存在
    fs.exists('users',has=>{
        if(!has){
            //文件夹不存在；新建文件夹
            fs.mkdir('users',err=>{
                  if(err) send('file error', '抱歉，系统错误');
                  else  saveFile()  
            })
        }else saveFile()
    })
})

/*--------------登录------------------*/
app.get('/login',function (req,res) {
    var petname = req.query.petname
    var filePath = 'users/' + petname + '.txt'

    //判断用户名是否存在
    fs.exists(filePath,exists=>{
        if(exists){
            //用户名存在
            fs.readFile(filePath,function (err,data) {
                console.log(JSON.parse(data))
                if(data){
                    //读取数据成功
                    var obj = JSON.parse(data)
                    if(obj.password == req.query.password){
                        //设置响应头中 cookie 字段  
                        //cookie  主要是网站为了鉴别用户的身份，分配给用户的一个标识符
                        //一般是一个加密字段
                        //会存储在浏览器对应的某一个文件中
                        //session cookie会在会话结束(浏览器窗口被关闭)时被移除
                        //session：会话
                        //在这里，借助cookie 短暂保存数据
                        res.cookie('petname',req.query.petname)
                        
                        res.json({'result':'1','message':'登录成功！'})
                    }else{
                        res.json({'result':'0','message':'密码错误,登录失败！'})
                    }
                }else{
                    //读取数据出错
                    res.json({'result':'0','message':'系统错误，请再次尝试！'})
                }
            })
        }else{
            res.json({'result':'0','message':'用户名不存在,请先注册！'})
        }
    })
})

/*-----------退出--------------*/
app.post('/logout',(req,res) =>{
    //服务器 删除cookie
    console.log('删除cookie')
    res.clearCookie('petname')
    res.json({'result':'1'})
})

/*----------------上传头像---------------*/
//处理请求之前，调用multer的single（一个）方法，处理name为photo的输入框对应的文件
app.post('/upload',upload.single('photo'), (req,res)=> {
    console.log('上传头像')
    //获取请求中的Cookie字段
    console.log(req.cookies)
    res.json({'result':'1','message':'上传头像成功'})
})


/*---------提问--------------*/
app.post('/ask',(req,res) =>{
    //保存问题 
    //questions/  一个文件保存 一个问题以及问题的答案
    //文件名：时间为文件名 new Date()  getTime()
    //待存储的内容：问题、用户名、时间、文件名
    var now = new Date()
    var time = now.getTime()
    var filePath = 'questions/' + time + '.txt'
    //存储对象
    var obj = {
        ask:req.body.ask,
        petname:req.cookies.petname,
        date:now,
        time:time
    }
    function saveFile(){
        fs.appendFile(filePath,JSON.stringify(obj),err=>{
            if(err) res.json({'result':'0','message':'系统错误,请再次尝试'})
            else res.json({'result':'1','message':'提问成功！！'})
        })
    }
    fs.exists('questions',exists=>{
        if(!exists){
            fs.mkdir('questions',error=>{
                if(error)  send('file error', '抱歉，系统错误');
                else  saveFile()
            })
        }else{
            saveFile()
        }
    })
})

/*-------------问答数据获取--------------*/
app.get('/questions',(req,res)=> {
    //获取所有的问题数据，进行展示
    fs.exists('questions',exists=>{
        if(exists){
            //读取文件夹中文件
            //files：数组，包含一个一个的文件名字符串
            fs.readdir('questions',(err,files)=> {
                if(err){
                    res.json({'result':'0','message':'系统错误，请尝试刷新页面'})
                }else{
                    //数组中元素颠倒顺序，获取新数组
                    files = files.reverse()
                    //声明一个数组，存储所有的问答数据
                    var questions = []
                    //遍历数组，读取每个文件的数据
                    for(var i =0 ; i < files.length;i ++){
                        //拼接路径
                        var filePath = 'questions/' + files[i]
                        //同步读文件
                       var data =  fs.readFileSync(filePath)
                       data = JSON.parse(data) 
                       //把数据入栈到数组中
                       questions.push(data)
                    }
                    res.json({'result':'1','message':questions})
                }
            })
        }
    })
})

/*------------回答--------------*/
app.post('/answer',(req,res)=> {
    console.log(req.body)
    //答案存到哪里？？
    //在对应的问题文件中添加 answers字段保存答案 

    //从cookie中获取问题文件名称以及回答的用户名
    var fileName = req.cookies.time + '.txt'
    var petname = req.cookies.petname 
    var filePath = 'questions/' + fileName
    //判断问题文件是否存在
    fs.exists(filePath,exists=>{
        if(exists){
            //存在的时候，读取文件
            fs.readFile(filePath,(err,data) =>{
                if(data){
                    //json解析
                    var obj = JSON.parse(data)
                    console.log(obj)
                    //如果answers字段不存在，说明之前没有人回答过这个问题
                    if(!obj.answers){
                        //创建这个字段，数组类型，一个元素代表一个答案
                        obj.answers = []
                    }

                    //组装问题答案
                    //用户名、时间、问题文件名、答案
                    var now = new Date()
                    var answer = {
                        petname:petname,
                        date:now ,
                        time:req.cookies.time,
                        answer:req.body.answer
                    }
                    obj.answers.push(answer)
                    //把问题重新写入文件（把原始内容覆盖）
                    fs.writeFile(filePath,JSON.stringify(obj),err=>{
                        if(err){
                            res.json({result:0,message:'系统错误,请再次尝试提交'})
                        }else{
                            res.json({result:1,message:'提交答案成功！！'})
                        }
                    })
                }
            })
        }
    })
})

app.listen(3000,()=>console.log('正在运行......'))

/**
 *  
 * 代码缺点：
 * 1) 不能看到开发过程
 * ------项目管理工具git
 * 2）文件系统保存数据，读写麻烦 
 * -----服务端数据库mongoDB
 * 3）所有的响应都在index.js文件；文件过长，不容易找到每一个请求，不利于代码维护
 * -----服务端路由
 * 4）首页展示问答采用拼接字符串方式，繁琐，易出错
 * ----模板化artTemplate
 * 5）------服务端代码的模块化
 * 6）------客户端代码的模块化
 * 7）回调函数嵌套易出错，逻辑复杂
 * ----异步请求的另一种解决方案---promise/deferred
 * 8）cookie存储，数据量小，在请求响应中来回传递
 * ----浏览器端其他的存储方案
 * */