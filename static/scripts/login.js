$('#goBack').click(function () {
    //历史记录后退
    history.go(-1)
})

$('#register').click(function(){
    location.href = 'register.html'
})


/**********提交***********/
$('form').submit(function(ev){
    //阻止默认提交行为
    ev.preventDefault()
    //发数据到服务器
    
    //获取form表单上数据，序列化为 key1=value1&key=value2...
    var data = $('form').serialize()
    $.get('/login',data,function(responseData){
       //响应处理
        //显示模态框
        $('.modal .modal-body').text(responseData.message)
        $('.modal').modal('show').on('hide.bs.modal',function(){
            //当模态框消失的时候会执行的回调函数
            if(responseData.result == 1){
                //注册成功，跳转到主页面
                location.href = '/'
            }
        })
    })
})