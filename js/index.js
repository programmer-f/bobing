$(function () {

    //定义数组保存获取到中奖信息
    // let luckyArr = null;
    //定义变量保存博饼结果信息
    let playResultInfo = null;
    //1.从url中截取code
    let code = strToObj(window.location.href);
    console.log('code是:',code);
    function strToObj(str) {
        if (str.includes('?')){
            let arr = str.split('?');
            let res = arr[1];
            let arr2 = res.split('&');
            let res2 = arr2[0];
            let arr3 = res2.split('=');
            return arr3[1];
        } else{

        }
    }


    //一进来获取中奖信息,做展示使用
    $.ajax({
        type:'GET',
        url:'http://47.93.24.43:9090/winList',
        success(res){
            // console.log('获取中奖信息');
            // console.log(res);
            // console.log(res.data);
             luckyArr = res.data;
            // console.log(luckyArr);
        },
        error(msg){
            // console.log(msg.status);
            console.log(msg.status);
        }
    });


    //2.拿到code后发给后端,只能请求一次
    if (localStorage.getItem('uId')){
        //如果uId已经存在就不向后端发送请求了
        // console.log('uId已经存在啦');
        //uId已经存在了就获取用户信息
        let uId = localStorage.getItem('uId');
        $.ajax({
            type:'get',
            url:`http://47.93.24.43:9090/getUserInfo/${uId}`,
            success(res){
                // alert(res.helpNumberNotIs5);
                //定义全局变量保存助力的标志
                 window.helpNumberNotIs5 = res.helpNumberNotIs5;
                // console.log(res.data);
                //将参数传给初始化的函数
                initUserInfo(res.data);
            },
            error(msg){
                console.log(msg.status);
            }
        });
    } else{
        console.log('第一次发送code');
        //uId不存在，向后端发送请求拿到uId并存储在localStorage里
        $.ajax({
            type:'GET',
            url:`http://47.93.24.43:9090/access_token?code=${code}`,
            success(res){
                // console.log(res.uId);
                localStorage.setItem("uId", res.uId);//将uId用localStorage存储
                window.uId = localStorage.getItem('uId');//绑定到window上
                let uId = localStorage.getItem('uId');
                //3.getUserInfo
                $.ajax({
                    type:'get',
                    url:`http://47.93.24.43:9090/getUserInfo/${uId}`,
                    success(res){
                        //定义全局变量保存助力的标志
                        window.helpNumberNotIs5 = res.helpNumberNotIs5;
                        // console.log(res.data);
                        //将参数传给初始化的函数
                        initUserInfo(res.data);
                    },
                    error(msg){
                        console.log(msg.status);
                    }
                });
            },
            error(msg){
                console.log(msg.status);
            }
        });
    }


    //3.一进来就发送请求getGameInfo
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

    //4.显示与隐藏活动规则
    $('.show-rules').click(function () {
        $('.mask').css('display','block');
        unScroll();
    });
    $('.close-button').click(function () {
        $('.mask').css('display','none');
        removeUnScroll();
    });


    //5.首页滚动展示中奖信息
    let $p = $('.showAndHide');
    let $span = $('.showAndHide>.person-name');
    showAndHide();
    function showAndHide() {
        let index = 0;
        setInterval(function () {
            $p.fadeOut(1000,function () {
                if (index === luckyArr.length){
                    index = 0;
                }
                $span.text(luckyArr[index++].userName);
            });
            $p.fadeIn(1000);
        })
    }

    //5.点击查看积分排行榜进行页面跳转
    $('.to-chart').click(function () {
        window.location.href = 'ranking.html';
    });

    //6.博饼相关
    let oBtn = document.querySelector('.game-play-btn');
    let oUls = document.querySelectorAll('ul');
    let oTimes = $('.times span');
    let timer = null;
    let timeout = null;
    let dotsArr = [];//保存每次博饼点数的数组
    //点击博饼按钮后执行的事情
        oBtn.onclick = function () {
            //控制次数,如果博饼次数为0且助力次数未满，则点击后弹出分享框
            if (parseInt(oTimes.text()) <= 0 && Number(window.helpNumberNotIs5) !== -1){
                //弹出分享框
                $('.share').css('display','block');
                //隐藏骰子
                for (let i = 0;i < oUls.length;i++){
                    $(oUls[i]).css({
                        display:'none'
                    });
                }
                //显示tips，并且替换内容
                $('.tips').text('今日博饼次数已用完!').css('display','block');
                //隐藏博饼结果信息
                $('.playResultInfo').css('display','none');
                return false;
            }
            //如果博饼次数为0且助力次数已满，则点击后不显示分享框
            else if (parseInt(oTimes.text()) <= 0 && Number(window.helpNumberNotIs5) === -1){
                //关闭分享框
                $('.share').css('display','none');

                let result = getCookie('drawed');
                // console.log(result);
                //判断今天有没有抽过奖
                //获取cookie
                function getCookie(key) {
                    let res = document.cookie.split(';');
                    for (let i = 0; i < res.length; i++) {
                        let temp = res[i].split('=');
                        if (temp[0].trim() === key) {
                            return temp[1];
                        }
                    }
                }

                if (Number(result) === 1){
                    //今天已经抽过奖了
                    $('.toLotteryDraw').css('display','none');
                    alert('今天已经抽过奖了，明天再来吧!');
                } else{
                    //如果博饼次数为0，且助力次数已满而且今天没有抽奖，弹出去抽奖的弹窗
                    $('.toLotteryDraw').css('display','block');
                }

                return false;
            }

            //改变次数
            oTimes.text(parseInt(oTimes.text()) - 1);
            //一进来就将tips设置为none
            $('.tips').css('display','none');
            clearTimeout(timer);
            for (let i = 0;i < oUls.length;i++){
                // console.log(i);
                //遍历骰子，让骰子旋转起来
                $(oUls[i]).css({
                    display:'block',
                    animation:`rotate${i} 1s linear`
                });
                //每次生成一个随机值（1----6）
                let number = getRandomIntInclusive(1,6);
                dotsArr.push(number);//将博饼的点数放到数组里面
                //骰子旋转完了之后,替换文字
                $(`ul:nth-of-type(${i + 1})>li:nth-child(6)`).text(number);
                $(`ul:nth-of-type(${i + 1})>li:nth-child(6)`).css({
                    'background':`url("images/${number}.png") no-repeat`,
                    'backgroundSize':'0.6rem 0.6rem'
                });
            }
            timer = setTimeout(function () {
                //遍历骰子，去掉动画，以便下一次点击在添加动画
                for (let i = 0;i < oUls.length;i++){
                    $(oUls[i]).css({
                        animation:''
                    });
                }
            },1000);
            addPoints(dotsArr);//先传后清空
            dotsArr.length = 0;//每次处理完清空dotsArr为下一次处理做准备

            //每次点击都发送请求去更新gameInfo,因为有时延，所以放在定时器里
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                console.log('发送请求');
                $.ajax({
                    type:'GET',
                    url:'http://47.93.24.43:9090/getGameInfo',
                    success(res) {
                        // console.log('马上要初始化啦');
                        // console.log(res.data);
                        initGameInfo(res.data);//初始化游戏信息
                    },
                    error(msg) {
                        console.log(msg);
                    }
                });
                // console.log('请求发送啦');
            },500)

        };

        //活动结束打开下面这句代码
        /*oBtn.onclick = function () {
             alert('如果您的积分在前30名，点击积分排行榜填写信息吧');
         };*/


    //累加积分以及更新积分
    function addPoints(arr) {
    // let changePoints = judge(arr) || 0;//容错处理
        let judgeRes = judge(arr);
        console.log('judge后的返回值',judgeRes);
        let changePoints = judgeRes.score || 0;//容错处理
        //给上面定义的保存博饼结果信息的变量赋值
        playResultInfo = judgeRes.info;
        //界面上显示博饼结果信息
        $('.playResultInfo').text(playResultInfo);
    let uId = localStorage.getItem('uId');
    //博饼累加积分的接口
      $.ajax({
          type:'POST',
          url:'http://47.93.24.43:9090/bobing',
          data:{
              uId:uId,
              changePoints:changePoints
          },
          success(res) {
              //发送请求，更新数据
              $.ajax({
                  type:'get',
                  url:`http://47.93.24.43:9090/getUserInfo/${uId}`,
                  success(res){
                      // console.log(res.data);
                      //将参数传给初始化的函数
                      initUserInfo(res.data);
                  },
                  error(msg){
                      console.log(msg.status);
                  }
              });
          },
          error(msg) {
              console.log(msg.status);
          }
      });
}

    //拿到UserInfo初始化数据
    function initUserInfo(obj) {
        // console.log(obj);
        let userName = obj.userName;//用户微信名称
        let userPicture = obj.userPicture;//用户头像
        let number = obj.number;//用户排名
        let remainingNumber = obj.remainingNumber;//剩余博饼次数
        let points = obj.points;//用户积分

        //初始化用户微信名称
        $('.person-info').text(userName);
        //初始化用户头像
        $('.person-profile>img').attr('src',userPicture);
        //初始化用户积分
        $('.person-score>span').text(points);
        //初始化用户剩余博饼次数
        $('.times>span').text(remainingNumber);

        //如果博饼次数为0修改tips
        if (Number(remainingNumber) === 0){
            $('.tips').text('没有博饼次数了!');
        }
    }

    //拿到GameInfo初始化数据
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

    //判断点数，返回相应的积分
    function judge(arr) {
        let str = String(arr.sort().join(''));//每次的点数  例：'224444'
        // console.log('排序后的字符串',str);
        //写出确定的结果的正则表达式
        let reg0 = /224444/;        //状元插金花
        let reg1 = /444444/;        //满堂红
        let reg2 = /111111/;        //遍地锦
        let reg3 = /4{5}/;        //五红
        let reg4 = /123456/;        //对堂
        let reg5 = /2{6}/;          //黑六勃
        let reg6 = /3{6}/;         //黑六勃
        let reg7 = /5{6}/;         //黑六勃
        let reg8 = /6{6}/;         //黑六勃
        let reg9 = /1{5}/;         //五子登科
        let reg10 = /2{5}/;         //五子登科
        let reg11 = /3{5}/;         //五子登科
        let reg12 = /5{5}/;         //五子登科
        let reg13 = /6{5}/;         //五子登科
        let reg14 = /1{4}/;         //四进
        let reg15 = /2{4}/;         //四进
        let reg16 = /3{4}/;         //四进
        let reg17 = /5{4}/;         //四进
        let reg18 = /6{4}/;         //四进
        let reg19 = /4{4}/;        //四点红
        let reg20 = /4{3}/;       //三红
        let reg21 = /4{2}/;       //二举
        let reg22 = /4/;          //一秀
        //存储结果的数组
        let regArr = [reg0,reg1,reg2,reg3,reg4,reg5,reg6,reg7,reg8,reg9,reg10,reg11,reg12,reg13,reg14,reg15,reg16,reg17,reg18,reg19,reg20,reg21,reg22];


        if (regArr[0].test(str)){
            return{
                score:15,
                info:'状元插金花,获得15积分'
            }
        }else if (regArr[1].test(str)){
            return{
                score:13,
                info:'满堂红,获得13积分'
            }
        }else if (regArr[2].test(str)){
            return{
                score:12,
                info:'遍地锦,获得12积分'
            }
        }else if (regArr[3].test(str) && !regArr[1].test(str)){
            return{
                score:10,
                info:'五红,获得10积分'
            }
        }else if (regArr[4].test(str)){
            return{
                score:5,
                info:'对堂,获得5积分'
            }
        }else if (regArr[5].test(str) || regArr[6].test(str) || regArr[7].test(str) || regArr[8].test(str)){
            return{
                score:11,
                info:'黑六勃,获得11积分'
            }
        }else if (regArr[9].test(str) || regArr[10].test(str) || regArr[11].test(str) || regArr[12].test(str) || regArr[13].test(str)){
            return{
                score:9,
                info:'五子登科,获得9积分'
            }
        }else if (regArr[14].test(str) || regArr[15].test(str) || regArr[16].test(str) || regArr[17].test(str) || regArr[18].test(str)){
            return{
                score:3,
                info:'四进,获得3积分'
            }
        }else if (regArr[19].test(str)){
            return{
                score:8,
                info:'四点红,获得8积分'
            }
        }else if (regArr[20].test(str)){
            return{
                score:4,
                info:'三红,获得4积分'
            }
        }else if (regArr[21].test(str)){
            return{
                score:2,
                info:'二举,获得2积分'
            }
        }else if (regArr[22].test(str)){
            return{
                score:1,
                info:'一秀,获得1积分'
            }
        }else{
            return{
                score:0,
                info:'未能获得积分，再来一次'
            }
        }

    }
    //禁用滚动条
    function unScroll() {
        let top = $(document).scrollTop();
        $(document).on('scroll.unable', function(e) {
            $(document).scrollTop(top);
        })
    }
    //解除滚动条的禁用
    function removeUnScroll() {
        $(document).unbind("scroll.unable");
    }

    //点击了去抽奖要做的事
    $('.goToLotteryDraw').click(function () {
        let times = parseInt($('.times span').text());
        //如果博饼的次数为0且助力标志以满5人则可以去抽奖
        if (Number(window.helpNumberNotIs5) === -1 && times === 0){
            //关闭弹出的面板
            $('.toLotteryDraw').css('display','none');
            //跳转到抽奖界面
            window.location.href = 'lotteryDraw.html';
        }


    });



    //点击面板上的关闭按钮关闭面板
    $('.close-notification').click(function () {
        $('.toLotteryDraw').css('display','none');
    });




    //点击分享弹窗上的关闭按钮
    $('.close-share').click(function () {
        $('.share').css('display','none');
    });




    //生成随机数的函数，上面有调
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
        //The maximum is inclusive and the minimum is inclusive
    }

});