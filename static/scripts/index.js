//js文件加载的时候，判断是否登录
// 如果未登录，显示 按钮标题为 登录；否则 为 petname

//借助cookie把登录成功时的用户名 存储到浏览器的cookie中了
//所以  如果能从浏览器的cookie中取出petname，说明已经登录了
//如果 从浏览器的cookie中取不到 petname，说明未登录

//从cookie中取出petname // jquery.cookie.js
var petname = $.cookie('petname')
console.log('petname' + petname)
//修改span的文本
if(petname){
    $('#login span:nth-child(2)').text(petname)
}else{
    $('#login span:nth-child(2)').text('登录')
}

$('#login').click(function(){
    //如果未登录，跳转到登录页面
    //如果已经登录，显示下拉菜单
    if(petname){
        //显示下拉菜单
        //添加 data-toggle="dropdown"
        $(this).attr('data-toggle','dropdown')
    }else{
        //跳转到登录
        location.href = 'login.html'
        //删除 data-toggle="dropdown"
        $(this).removeAttr('data-toggle')
    }
})

//点击退出按钮的操作
$('ul li:nth-child(3) a').click(function(){
    //发送 退出 请求 
    console.log('退出 点击了')
    $.post('/logout',function(responseData){
        //刷新界面
        console.log('----')
        location.href = '/'
    })
})

//点击提问的操作
$('#ask').click(function(){
    //如果未登录，跳转到登录界面
    //如果已登录，跳转到提问页面
    if(petname){
        //已经登录，跳转到提问页面
        location.href = 'ask.html'
    }else{
        //未登录，跳转到登录界面
        location.href = 'login.html'
    }
})

//页面加载完成，向服务器发请求获取问答数据
window.onload = function(){
    //发请求，获取问答数据
    $.get('/questions',function(responseData){
        if(responseData.result == 0){
            //错误提示
             $('.modal .modal-body').text(responseData.message)
             $('.modal').modal('show')
        }else{
            //内容展示
            var array = responseData.message
            console.log(array)
            //拼接html文档
            var html = ''
            for(var i = 0 ;i < array.length; i++){
                var obj = array[i]
                //添加data-time属性，存储问题文件名称
                html += '<section class="question" data-time="' + obj.time + '">'

                //onerror ：加载图片出错对应的触发事件
                //就一句代码：修改图片路径为 this.src='images/user.png'
                // \' :转义字符,表示普通引号 ; 
                //在这里需要使用引号这个标点符号，但是引号作为字符串标志存在

                html += '<img src="upload/' +　obj.petname　+ '.jpg" onerror="this.src=\'images/user.png\'">'
                html += '<section>'
                html += '<h3>' + obj.petname + '</h3>'
                html += '<p>' + obj.ask + '</p>'
                html += '<time>' + getDateStr(obj.date) + '</time>'
                html += '</section>'
                html += '</section>'

                // 判断这个问题是否有答案，如果有，显示答案
                if(obj.answers){
                    //for循环拼接所有的答案
                    for(var j = 0 ;j < obj.answers.length;j++){
                        var answer = obj.answers[j]
                        //拼接答案
                        html += '<section class=".answer">'
                        html +=  '<section>'
                        html += '<h3>' + answer.petname + '</h3>'
                        html += '<p>' +  answer.answer + '</p>'
                        html += '<time>' + getDateStr(answer.date) + '</time>'
                        html += '</section>'
                        html += '<img src="upload/' +answer.petname　+ '.jpg" onerror="this.src=\'images/user.png\'">'
                        html += '</section>'
                    }
                }
            }
            //把html放在对应的标签上
            $('#questions').html(html)
        }
    })
}

function getDateStr(date){
    //根据日期的字符串生成日期对象
    var time = new Date(date)
    console.log(time)

    var year = time.getFullYear()
    var month = time.getMonth() + 1 
    var day = time.getDate()

    var hour = time.getHours()
    var minute = time.getMinutes()
    var second = time.getSeconds()

    hour = hour < 10? '0'+hour : hour
    minute = minute<10 ? '0'+minute :minute
    second = second<10 ? '0'+second :second

    var str = year + '-' + month + '-' + day + '  ' + hour + ':' + minute + ':' + second
    console.log(str)
    return str
}

//点击问题
//如果未登录，去登录界面
//如果已登录，去回答界面

//注意下面的输出中 jquery中没有标签元素
//原因：请求时异步的，程序执行到这里的时候，服务器端尚未反馈问答数据，也就是界面上还没有 question对应的section
console.log($('#questions .question'))
//采用 delegate添加事件；可以给【未来】的元素添加事件
//给 #questions .question 元素添加 click事件
$('#questions').delegate('.question','click',function(){
    console.log('点击了')
    if(petname){
        location.href = 'answer.html'
        //获取点击的问题对应的文件名
        var fileName = $(this).attr('data-time')
        //把文件名 保存到 cookie中
        $.cookie('time',fileName)
    }else{
        location.href = 'login.html'
    }
})



