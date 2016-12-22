$('#goBack').click(function () {
    //历史记录后退
    history.go(-1)
})

/**********提交***********/
$('form').submit(function(ev){
    //阻止默认提交行为
    ev.preventDefault()

    //判断两次密码是否一致
    //找到form中所有的type=password的标签，放在jquery对象中
    //map:以jquery对象中每一个标签为数据，执行function,
    //返回值依次放入一个新的jquery对象中
    
    //类似 [input1 , input2] 
    //map之后得到  [input1的值 , input2的值]
    
    var obj =  $(':password').map(function(){
        return $(this).val() 
    })
    //密码不一致时，执行结束
    if(obj[0] != obj[1]){
        //模态弹出，提示用户
        $('.modal .modal-body').text('两次输入不一致,请重新输入')
        $('.modal').modal('show')
        return 
    }

    //发数据到服务器
    
    //获取form表单上数据，序列化为 key1=value1&key=value2...
    var data = $('form').serialize()
    $.post('/register',data,function(responseData){
       //响应处理

        //显示模态框
        $('.modal .modal-body').text(responseData.message)
        $('.modal').modal('show').on('hide.bs.modal',function(){
            //当模态框消失的时候会执行的回调函数
            if(responseData.result == 1){
                //注册成功，跳转到登录页面
                location.href = 'login.html'
            }
        })
    })
})
