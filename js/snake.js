/*
 *单个格子类，定义这个类可以作为蛇和食物的单个节点。
 *蛇可以由多个格子组成，食物可以由一个格子组成。
 */
function Cell(x, y) {
    this.x = x;//横坐标
    this.y = y;//纵坐标
}
Cell.prototype.paint = function (ctx) {
    ctx.fillStyle = "black";//格子颜色
    ctx.fillRect(Cell.s * this.x, Cell.s * this.y, Cell.s, Cell.s);
};
Cell.s = 8;//格子大小,模拟为静态变量

var snake = function (canvas, sel, score, startGameId, endGameId, pauseGameId, continueGameId) {
    var canvas = document.getElementById(canvas);//获取面板
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');//获取绘图面板
        var width = canvas.width;//面板宽
        var height = canvas.height;//面板高
        var row = height / Cell.s;//行数
        var col = width / Cell.s;//列数
        var body = [];//蛇主体
        var di = {//定义方向参数
            left: 1,
            right: -1,
            up: 2,
            down: -2
        };
        var dir = di.right;//控制运行方向
        var now = di.right;//当前运行方向
        var timer;
        var speed = 500;//运行速度
        var food = randomFood();//食物
        var gameStatus = 0;//游戏状态,0-游戏结束，1-游戏进行中

        document.getElementById(startGameId).onclick = startGame;
        document.getElementById(endGameId).onclick = endGame;
        document.getElementById(pauseGameId).onclick = pauseGame;
        document.getElementById(continueGameId).onclick = continueGame;
        document.getElementById(sel).onchange = setSpeed;
        window.onkeydown = changeDir;

        /*
         * 游戏开始
         */
        function startGame() {
            /*
             * 初始化蛇
             * 蛇在初始的情况下，有四个节点，它们的位置为（3，0）（2，0）（1，0）（0，0）
             * 这样蛇就是从面板的左上方出来。
             */
            if (gameStatus == 0) {
                gameStatus = 1;
                body = [
                    new Cell(3, 0),
                    new Cell(2, 0),
                    new Cell(1, 0),
                    new Cell(0, 0),
                ];
                timer = window.setInterval(move, speed);//启动定时器，让蛇开始爬行。
            }
        }

        /*
         * 游戏结束
         */
        function endGame() {
            if (timer != null) {
                gameStatus = 0;
                window.clearInterval(timer);//关闭定时器
                body = [];//将数组清空
                repaint();//将面板刷新
            }
        }

        /*
         * 游戏暂停
         */
        function pauseGame() {
            window.clearInterval(timer);//关闭定时器
        }

        /*
         * 游戏继续
         */
        function continueGame() {
            timer = window.setInterval(move, speed);//启动定时器
        }

        /*
         * 键盘监听事件
         * 通过监听键盘的输入，来控制蛇的运行方向
         */
        function changeDir(event) {
            var key = event.keyCode;//得到键盘按下的键的编码
            /*
             * 注：左键，上键，右键，下键的编码分别为整数：37，38，39，40。
             * left:37
             * up:38
             * right:39
             * down:40
             */
            switch (key) {
                case 37:
                    dir = di.left;
                    break;
                case 38:
                    dir = di.up;
                    break;
                case 39:
                    dir = di.right;
                    break;
                case 40:
                    dir = di.down;
                    break;
            }
            move();
        }

        /*
         * 随机生成食物
         */
        function randomFood() {
            var x = Math.round(Math.random() * (col - 1));//随机生成食物的横坐标
            var y = Math.round(Math.random() * (row - 1));//随机生成食物的纵坐标
            var food = new Cell(x, y);
            return food;
        }

        /*
         * 判断是否撞到自己
         */
        function isUs() {
            //分别得到蛇头节点的横纵坐标
            var x = body[0].x;
            var y = body[0].y;
            //用头节点的横纵坐标，通过循环一一和自己的其他节点坐标比较，如果都相等则返回true
            for (var i = 3; i < body.length; i++) {
                if (body[i].x == x && body[i].y == y) {
                    return true;
                }
            }
        }

        /*
         * 判断是否撞墙
         */
        function isWall() {
            //分别得到蛇头节点的横纵坐标
            var x = body[0].x;
            var y = body[0].y;
            //超出范围则代表撞墙了，返回true
            if (x < 0 || x > col - 1 || y < 0 || y > row - 1) {
                return true;
            } else {
                return false;
            }
        }

        /*
         * 判断蛇是否吃到食物
         * 如果吃到食物返回true,并且在头部新添加一个节点
         * 否则返回false;
         */
        function eatFood() {
            //分别得到蛇头节点的横纵坐标
            var x = body[0].x;
            var y = body[0].y;
            //如果吃到食物返回true,并且在头部新添加一个节点
            if (x == food.x && y == food.y) {
                body.unshift(food);//在蛇的数组头部添加一个节点
                return true;
            } else {
                return false;
            }
        }

        /*
         * 蛇爬行一步
         *
         */
        function oneStep() {
            //判断蛇当前的方向和控制蛇运行的方向是否相反，如果不相反则令当前的方向等于控制的方向
            if (dir + now != 0) {
                now = dir;
            }
            body.pop();//移除末尾节点
            //根据方向，定义新的头节点
            var head;
            switch (now) {
                case di.left:
                    head = new Cell(body[0].x - 1, body[0].y);
                    break;
                case di.right:
                    head = new Cell(body[0].x + 1, body[0].y);
                    break;
                case di.up:
                    head = new Cell(body[0].x, body[0].y - 1);
                    break;
                case di.down:
                    head = new Cell(body[0].x, body[0].y + 1);
                    break;
            }
            body.unshift(head);//将新头节点，添加到数组头部
        }

        /*
         * 蛇在运行每一步的过程中所有要执行的方法
         */
        function move() {
            oneStep();//蛇爬行一步
            repaint();//刷新整个面板
            food.paint(ctx);//绘制食物
            showWorm();//绘制蛇
            showScore();//显示得分
            if (isUs() || isWall()) {
                endGame();
            }//判断是否撞墙或撞到自己，如果是就结束游戏。
            if (eatFood()) {
                food = randomFood();
            }//判断蛇是否吃到食物，如果吃到就重新创建一个食物
        }

        /*
         * 刷新整个面板
         * 这里刷新面板的方法是：先找到面板对象
         * 再将面板下面的所有元素全部删除，从而达到刷新的目的。
         */
        function repaint() {
            ctx.clearRect(0, 0, width, height);
        }

        /*
         * 绘制蛇
         */
        function showWorm() {
            body.forEach(function (cell) {
                cell.paint(ctx);
            });
        }

        /*
         * 显示得分
         */
        function showScore() {
            document.getElementById(score).innerHTML = body.length;//通过数组的长度来显示得分
        }

        /*
         * 设置难度
         */
        function setSpeed() {
            speed = document.getElementById(sel).value;
        }
    }
};