$(function () {
    let personRankingNumber;
    //1.getGameInfo
    $.ajax({
        type:'GET',
        url:'http://47.93.24.43:9090/getGameInfo',
        success(res) {
            // console.log(res.data);
            initGameInfo(res.data);//初始化游戏信息
        },
        error(msg) {
            console.log(msg.status);
        }
    });
    //拿到GameInfo后初始化
    function initGameInfo(obj) {
        let userNumber = obj.userNumber;//参与人数
        let allPlayTimes = obj.number;//总博饼次数
        let userNumberSpan = $('.userNumber>span');
        let allPlayTimesSpan = $('.allPlayTimes>span');
        let popularSpan = $('.popular>span');
        //初始化参与人数
        if (Number(userNumber) > 1000){
            if (Number(userNumber) > 10000){
                userNumberSpan.text('1w+');
            }
            userNumberSpan.text('999+');
        } else{
            userNumberSpan.text(userNumber);
        }

        //初始化总博饼次数
        if (Number(allPlayTimes) > 1000){
            if (Number(allPlayTimes) > 10000){
                allPlayTimesSpan.text('1w+');
            }
            allPlayTimesSpan.text('999+');
        } else{
            allPlayTimesSpan.text(allPlayTimes);
        }

        //初始化活动人气（活动人气的计算：参与人数 + 55）
        if (Number(userNumber) > 1000){
            if (Number(userNumber) > 10000){
                popularSpan.text('1w+');
            }
            popularSpan.text('999+');
        } else{
            popularSpan.text(userNumber);
        }

    }


    //2.getUserInfo初始化个人排名
    let uId = localStorage.getItem('uId');
    $.ajax({
        type:'get',
        url:`http://47.93.24.43:9090/getUserInfo/${uId}`,
        success(res){
            // console.log(res.data);
            //将参数传给初始化的函数
            initPersonRanking(res.data);
        },
        error(msg){
            console.log(msg);
        }
    });

    //初始化个人排名
    function initPersonRanking(obj){
        personRankingNumber = obj.number;//保存个人排名
        $('.person-ranking>span').text(obj.number);
    }


   //点击去博饼跳转到游戏界面
   $('.to-play').click(function () {
       window.location.href = 'index.html';
   });


    //点击填写信息跳转到填写信息界面,活动结束后再开放
   $('.to-personInfo').click(function () {
        //弹出提示（活动结束后将这句代码删掉）
       $('.infoMask').css('display','block');


       //排名前30可以跳转（活动结束后，将下面代码打开）
      /*if (personRankingNumber >= 1 && personRankingNumber <= 30){
           window.location.href = 'personInfo.html';
       }else{
           alert('您不是前30名!');
       }*/
   });

   //点击 我知道了 关闭弹窗
    $('.close-infoMask').click(function () {
        $('.infoMask').css('display','none');
    })
});