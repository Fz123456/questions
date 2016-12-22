$('#goBack').click(function(){
    history.go(-1)
})

$('form').submit(function(ev){
    ev.preventDefault()

    $.post('/ask',
    $('form').serialize(),
    function(responseData){
        //响应处理
        //显示模态框
        $('.modal .modal-body').text(responseData.message)
        $('.modal').modal('show').on('hide.bs.modal',function(){
            //当模态框消失的时候会执行的回调函数
            if(responseData.result == 1){
                //提问成功，跳转到主页面
                location.href = '/'
            }
        })
    })
})