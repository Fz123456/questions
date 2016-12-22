$('#goBack').click(function(){
    history.go(-1)
})

$('form').submit(function(ev){
    ev.preventDefault()

    //图片上传
    var data = new FormData(this)
    
    //修改 contentType、processData的取值为false
    // 原因：jquery内部默认会把数据转化为查询字符串；
    //而图片是不能转化为字符串的；
    $.post({
        url:'/upload',
        data:data,
        contentType:false,
        processData:false,
        success:function(responseData){
            location.href = '/'
        }
    })
})