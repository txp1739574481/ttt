var over = false;
//五子棋局是否结束

var me = true;
//人先下棋，黑色

var _nowi = 0,
    _nowj = 0;
//记录人下棋的坐标

var _compi = 0,
    _compj = 0;
//记录计算机当前下棋的坐标

var _myWin = [],
    _compWin = [];
//记录人_myWin，计算机_compWin赢的情况

var backAble = false,
    //记录悔棋状况
    returnAble = false;
//记录取消悔棋的状态

var resultTxt = document.getElementById('result-wrap');
//输出胜负状况

var chressBord = [];
//遍历棋盘，是否有棋子，默认为0没有
for (var i = 0; i < 15; i++) {
    chressBord[i] = [];
    for (var j = 0; j < 15; j++) {
        chressBord[i][j] = 0;
        //没有棋子
    }
}
//棋盘

/*赢法数组*/
var myWin = [];
//人赢法的统计数组

var computerWin = [];
//计算机赢法的统计数组

var wins = [];
//赢法数组

for (var i = 0; i < 15; i++) {
    wins[i] = [];
    for (var j = 0; j < 15; j++) {
        wins[i][j] = [];
    }
}
var count = 0;
//赢法总数

for (var i = 0; i < 15; i++) {
    //横线五个棋子赢法
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i][j + k][count] = true;
        }
        count++;
    }
}

for (var i = 0; i < 15; i++) {
    //竖线五个棋子赢法
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[j + k][i][count] = true;
        }
        count++;
    }
}

for (var i = 0; i < 11; i++) {
    //正斜线五个棋子赢法
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j + k][count] = true;
        }
        count++;
    }
}

for (var i = 0; i < 11; i++) {
    //反斜线五个棋子赢法
    for (var j = 14; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j - k][count] = true;
        }
        count++;
    }
}


for (var i = 0; i < count; i++) {
    //对数据初始化
    myWin[i] = 0;
    //人赢法的统计数组
    _myWin[i] = 0;
    //人_myWin赢的情况
    computerWin[i] = 0;
    //计算机赢法的统计数组
    _compWin[i] = 0;
    //计算机_compWin赢的情况
}

/* 画棋盘，画棋子，判断输赢 */
var chess = document.getElementById("chess");
//获取canvas版面
var context = chess.getContext('2d');
//面板是2D的
context.strokeStyle = '#948989';
//边框颜色
var backbtn = document.getElementById("goback");
//悔棋按钮
var returnbtn = document.getElementById("return");
//撤销悔棋按钮
window.onload = function() {
    drawChessBoard();
    // 画棋盘
}
document.getElementById("restart").onclick = function() {
    //重新开始下一局，刷新页面
    window.location.reload();
}

chess.onclick = function(e) {
    // 人下棋
    if (over) {
        //判断棋局是否结束
        return;
    }
    if (!me) {
        //判断是否是人下棋
        return;
    }
    // 悔棋功能可用
    backbtn.className = backbtn.className.replace(new RegExp("(\\s|^)unable(\\s|$)"), " ");
    var x = e.offsetX;
    //鼠标当前在的x/横坐标
    var y = e.offsetY;
    //鼠标当前在的y/竖坐标
    var i = Math.floor(x / 30);
    //落子的x/横坐标
    var j = Math.floor(y / 30);
    //落子的y/竖坐标
    _nowi = i;
    //记录人下棋的x坐标
    _nowj = j;
    //记录人下棋的y坐标
    if (chressBord[i][j] == 0) {
        oneStep(i, j, me);
        //下棋
        chressBord[i][j] = 1;
        //人已占位置        
        for (var k = 0; k < count; k++) { // 将可能赢的情况都加1
            if (wins[i][j][k]) {
                myWin[k]++;
                //人赢法的统计数组
                _compWin[k] = computerWin[k];
                //计算机_compWin赢的情况
                computerWin[k] = 6; //这个位置对方不可能赢了
                if (myWin[k] == 5) {

                    var str = "恭喜获胜<br>  * ★, ° *: .☆(￣▽￣) / $: * .°★*。";;
                    resultTxt.innerHTML = str;
                    //人已经胜出，输出结果
                    over = true;
                    //已经分出胜负，棋局结束
                }
            }
        }
        if (over == false) {
            me = !me;
            computerAI();
            //人下完棋，该计算机下棋了
        }
    }
}

backbtn.onclick = function(e) { // 悔棋
    if (!backAble) { return; }
    over = false;
    me = true;
    returnbtn.className = returnbtn.className.replace(new RegExp("(\\s|^)unable(\\s|$)"), " ");
    // 我，悔棋
    chressBord[_nowi][_nowj] = 0;
    //我，已占位置 还原
    minusStep(_nowi, _nowj);
    //销毁棋子                                  
    for (var k = 0; k < count; k++) {
        // 将可能赢的情况都减1
        if (wins[_nowi][_nowj][k]) {
            myWin[k]--;
            //人赢法的统计数组
            computerWin[k] = _compWin[k];
            //计算机_compWin赢的情况
            //这个位置对方可能赢
        }
    }

    /*计算机相应的悔棋*/
    chressBord[_compi][_compj] = 0;
    //计算机，已占位置 还原
    minusStep(_compi, _compj);
    //销毁棋子                                  
    for (var k = 0; k < count; k++) {
        // 将可能赢的情况都减1
        if (wins[_compi][_compj][k]) {
            computerWin[k]--;
            myWin[k] = _myWin[i];
            //人mywin赢法的统计数组，人_myWin赢的情况
            //这个位置对方可能赢
        }
    }

    /* 当悔棋时，会插入“悔棋中.... ”，表示当前在悔棋之后，还没有下棋之前*/
    var url = "./image/black.png";
    var str = "<img src = '" + url + "' width='50' height='50' >" + "悔棋中....";
    resultTxt.innerHTML = str;

    returnAble = true;
    //已下棋子，把撤销悔棋状态变为已取消
    backAble = false;
    //已经重新下了棋，不在悔棋状态了
}

returnbtn.onclick = function(e) {
        // 撤销悔棋
        if (!returnAble) { return; }
        // 我，撤销悔棋
        chressBord[_nowi][_nowj] = 1; //我，已占位置 
        oneStep(_nowi, _nowj, me);
        for (var k = 0; k < count; k++) {
            if (wins[_nowi][_nowj][k]) {
                myWin[k]++;
                _compWin[k] = computerWin[k];
                //计算机_compWin赢的情况
                computerWin[k] = 6; //这个位置对方不可能赢
            }
            if (myWin[k] == 5) {
                var str = "恭喜获胜<br>  * ★, ° *: .☆(￣▽￣) / $: * .°★*。";;
                resultTxt.innerHTML = str;
                //人已经胜出，输出结果
                over = true;
                //已经分出胜负，棋局结束
            }
        }
        // 计算机撤销相应的悔棋
        chressBord[_compi][_compj] = 2; //计算机，已占位置   
        oneStep(_compi, _compj, false);
        for (var k = 0; k < count; k++) { // 将可能赢的情况都减1
            if (wins[_compi][_compj][k]) {
                computerWin[k]++;
                _myWin[k] = myWin[k];
                //人_myWin赢的情况
                myWin[k] = 6; //这个位置对方不可能赢
            }
            if (computerWin[k] == 5) {

                var str = "很遗憾，你输了";
                resultTxt.innerHTML = str;
                //计算机已经胜出，输出结果
                over = true;
                //已经分出胜负，棋局结束
            }
        }
        returnbtn.className += ' ' + 'unable';
        returnAble = false;
        backAble = true;
    }
    // 计算机下棋
var computerAI = function() {
    var myScore = [];
    var computerScore = [];
    var max = 0; //最大权值，即胜负的得分
    var u = 0, //计算机下棋的x/横坐标
        v = 0; //计算机下棋的y/竖坐标
    for (var i = 0; i < 15; i++) {
        myScore[i] = []; //人赢的权值
        computerScore[i] = []; //计算机赢的权值
        for (var j = 0; j < 15; j++) {
            myScore[i][j] = 0;
            computerScore[i][j] = 0;
        }
    }
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {

            /*电脑在判在哪里下自己的得分最高，最可能赢*/
            if (chressBord[i][j] == 0) {
                //找棋盘上的没有落子的格子
                for (var k = 0; k < count; k++) {
                    if (wins[i][j][k]) {
                        //统计人赢的权值
                        if (myWin[k] == 1) {
                            myScore[i][j] += 200;
                        } else if (myWin[k] == 2) {
                            myScore[i][j] += 400;
                        } else if (myWin[k] == 3) {
                            myScore[i][j] += 2000;
                        } else if (myWin[k] == 4) {
                            myScore[i][j] += 10000;
                        }

                        if (computerWin[k] == 1) {
                            //统计计算机赢的权值
                            computerScore[i][j] += 220;
                        } else if (computerWin[k] == 2) {
                            computerScore[i][j] += 420;
                        } else if (computerWin[k] == 3) {
                            computerScore[i][j] += 2100;
                        } else if (computerWin[k] == 4) {
                            computerScore[i][j] += 20000;
                        }
                    }
                }

                if (myScore[i][j] > max) {
                    max = myScore[i][j];
                    u = i;
                    v = j;
                } else if (myScore[i][j] == max) {
                    if (computerScore[i][j] > computerScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }

                if (computerScore[i][j] > max) {
                    max = computerScore[i][j];
                    u = i;
                    v = j;
                } else if (computerScore[i][j] == max) {
                    if (myScore[i][j] > myScore[u][v]) {
                        u = i;
                        v = j;
                    }
                }

            }
        }
    }

    _compi = u;
    _compj = v;
    //计算机下棋的x,y坐标
    oneStep(u, v, false);
    //计算机找到得分最大的下棋位置
    chressBord[u][v] = 2;
    //计算机下棋
    for (var k = 0; k < count; k++) {
        if (wins[u][v][k]) {
            computerWin[k]++;
            _myWin[k] = myWin[k];
            //人_myWin赢的情况
            myWin[k] = 6;
            //这个位置对方不可能赢了
            if (computerWin[k] == 5) {
                // resultTxt.innerHTML = '很遗憾，你输了';
                var str = "很遗憾，你输了";
                resultTxt.innerHTML = str;
                //计算机已经胜出，输出结果
                over = true;
                //已经分出胜负，棋局结束
            }
        }
    }
    if (!over) {
        //没有结束，让人下棋
        me = !me;
    }
    backAble = true;
    returnAble = false;
    var hasClass = new RegExp('unable').test(' ' + returnbtn.className + ' ');
    if (!hasClass) {
        returnbtn.className += ' ' + 'unable';
    }
}

//绘画棋盘
var drawChessBoard = function() {

    for (var i = 0; i < 15; i++) {
        context.moveTo(15 + i * 30, 15);
        //把路径移动到画布中的指定点，不创建线条
        context.lineTo(15 + i * 30, 435);
        //添加一个新点，然后在画布中创建从该点到最后指定点的线条
        context.stroke();
        //在画布上绘制确切的路径
        context.moveTo(15, 15 + i * 30);
        //把路径移动到画布中的指定点，不创建线条
        context.lineTo(435, 15 + i * 30);
        //添加一个新点，然后在画布中创建从该点到最后指定点的线条
        context.stroke();
        //在画布上绘制确切的路径
    }
}

//画棋子
var oneStep = function(i, j, me) {

    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
    // 画圆，圆心i, 圆心j ,半径13, 弧度(起)0 ,弧度(止)2 * Math.PI
    context.closePath();
    //棋子颜色渐变
    var gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);
    if (me) {
        gradient.addColorStop(0, '#0a0a0a');
        //外圆颜色 0代表百分比
        gradient.addColorStop(1, '#636766');
        //内圆颜色 1代表百分比
    } else {
        gradient.addColorStop(0, '#d1d1d1');
        //外圆颜色 0代表百分比
        gradient.addColorStop(1, '#f9f9f9');
        //内圆颜色 1代表百分比
    }
    context.fillStyle = gradient;
    context.fill(); //填充棋子颜色
    resultTxt.innerHTML = '五子棋小游戏';
}

//悔棋，销毁棋子
var minusStep = function(i, j) {

    context.clearRect((i) * 30, (j) * 30, 30, 30);
    //擦除该圆
    context.beginPath();
    // 重画该圆周围的格子
    context.moveTo(15 + i * 30, j * 30);
    //把路径移动到画布中的指定点，不创建线条
    context.lineTo(15 + i * 30, j * 30 + 30);
    //添加一个新点，然后在画布中创建从该点到最后指定点的线条
    context.moveTo(i * 30, j * 30 + 15);
    //把路径移动到画布中的指定点，不创建线条
    context.lineTo((i + 1) * 30, j * 30 + 15);
    //添加一个新点，然后在画布中创建从该点到最后指定点的线条
    context.stroke();
    //在画布上绘制确切的路径
}


/*登录页面*/
account.onchange = function() {
    var account = this.value;
    var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{2,20}$/;
    if (reg.test(account)) {} else {
        alert("邮箱格式不正确");
    }
}
passworld.onchange = function() {
    var passworld = this.value;
    var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{1,20}$/;
    if (reg.test(passworld)) {} else {
        alert("密码格式不正确");
    }
}

function denlu() {


    var p = document.getElementById("password").value;
    var e = document.getElementById("account").value;
    // var p2 = localStorage.getItem("123");
    // var e2 = localStorage.getItem("123");
    var p2 = '123';
    var e2 = '123';
    if (p == p2 && e == e2)
        window.location.href = "wuziqi.html";
    else {
        alert("账号或密码不正确");
    }

}