$(function () {
    //进来先获取用户的信息
    let uId = localStorage.getItem('uId');
    console.log(uId);
    $.ajax({
        type:'get',
        url:`http://47.93.24.43:9090/getUserInfo/${uId}`,
        success(res){
            // console.log(res.data);
            //将参数传给初始化的函数
            initUserRanking(res.data);
        },
        error(msg){
            console.log(msg);
        }
    });


    function initUserRanking(obj){
        $('.userRankingNumber').text(obj.number);
    }


   $('.submit').click(function () {
       // let uId = '20190804023259836872';
       let uId = localStorage.getItem('uId');
       // console.log(uId);
       let userName = $('.userName').val();
       let phone = $('.phone').val();
       let address = $('.address').val();
       //发送请求提交信息
       $.post('http://47.93.24.43:9090/addAddress',{
           "uId":uId,
           "userName":userName,
           "phone":phone,
           "address":address
       },function (data) {
           // console.log(data);
           //清空input里面的数据
           $('.userName').val('');
           $('.phone').val('');
           $('.address').val('');
           alert('信息提交成功!')
       },'json')

   });


});