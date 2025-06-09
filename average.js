let canvas = document.getElementById("mycanvas");
let ctx = canvas.getContext("2d"); 

const ball = {
    x: canvas.width/2,
    y: canvas.height-43,
    radius: 18,
    speed: 3,
    dx: 0,
    dy: 0
};

const paddle = {
    height: 25,
    width: 125,
    x: (canvas.width - 125)/2,
    dx: 0
};

const row = 3;
const column = 7;
const brickHeight = 20;
const brickWidth = 75;
const brickPadding = 10;
const brickGapLeft = 8;
const brickGapTop = 50;

const bricks = [];

for (c = 0; c < column; c++) {
    bricks[c] = [];
    for (r = 0; r < row; r++) {
        bricks[c][r] = {x: 0, y: 0, status: 1};
    }
}

function drawBricks() {
    for (c = 0; c < column; c++) {
        for(r = 0; r < row; r++) {
            if(bricks[c][r].status == 1) {
                const brickX = (c*(brickWidth+brickPadding))+brickGapLeft;
                const brickY = (r*(brickHeight+brickPadding))+brickGapTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#FA8072";
                ctx.fill();
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.fill();
} 

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = "blue";
    ctx.fill();
}

let score  = 0;

function drawScore() {
    ctx.font = '17px Arial';
    ctx.fillStyle = "white";
    ctx.fillText("Score: "+score, 8, 20);
}

function collision() {
    for (c = 0; c < column; c++) {
        for(r = 0; r < row; r++) {
            if(bricks[c][r].status == 1) {
                if (ball.x > bricks[c][r].x && ball.x < bricks[c][r].x + brickWidth && ball.y > bricks[c][r].y && ball.y < bricks[c][r].y + brickHeight) {
                    ball.dy = -ball.dy;
                    bricks[c][r].status = 0;
                    score++;
                }
            }
        }
    }
}

function gameOver() {
    ctx.font = '60px Times New Roman';
    ctx.fillStyle = "white";
    ctx.fillText("Game Over", canvas.width/4, canvas.height/2);  
} 

function youWin() {
    ctx.font = '60px Times New Roman';
    ctx.fillStyle = "white";
    ctx.fillText("YOU WIN", canvas.width/4, canvas.height/2);
}

let nameEntered = false; 

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawBall();
    drawPaddle();
    collision(); 
    drawScore(); 

//движение платформы
    paddle.x += paddle.dx;

    if(paddle.x + paddle.dx < 0) {
        paddle.x = 0
    }
    else if( paddle.x+paddle.width + paddle.dx > canvas.width){
        paddle.x = canvas.width-paddle.width
    }

//движение мяча
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.dx < ball.radius || ball.x+ball.dx > canvas.width - ball.radius) {
        ball.dx *= -1;
    }
    if (ball.y + ball.dy < ball.radius){
        ball.dy *= -1;
    }
    if (ball.y + ball.dy > canvas.height-ball.radius){
        gameOver();
        const records = JSON.parse(localStorage.getItem("easyRecords")) || [];
        if (isInTopTen(score, records)) {
            saveRecord();
        }
        drawScore();
        function delay(){document.location.reload();}
        setTimeout(delay, 1000);
    }

    if(ball.y + ball.dy > canvas.height - paddle.height - ball.radius){
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width ){
            ball.dy *= -1;
        }
    }

    if (score == row*column) {
        youWin();

        const records = JSON.parse(localStorage.getItem("easyRecords")) || [];
        if (isInTopTen(score, records)) {
            saveRecord();
        }

    drawScore();
        function delay(){document.location.reload();}
        setTimeout(delay, 1000);
    }
 
    
}

function isInTopTen(currentScore, records) {
    if (records.length < 10) { // Если меньше 10 рекордов, то текущий счет всегда входит в топ-10
        return true;
    }
    records.sort((a, b) => b.score - a.score);// Сортируем рекорды по убыванию
    return currentScore > records[9].score;// Сравниваем текущий счет с десятым лучшим результатом
}

function updateLeaderboard() {
    const easyRecordsList = document.getElementById("easyRecords");
    easyRecordsList.innerHTML = "";

    const records = JSON.parse(localStorage.getItem("easyRecords")) || [];

    records.forEach((record) => {
        const listItem = document.createElement("li"); //Для каждой записи создается новый элемент списка (<li>)
        listItem.textContent = `${record.name}: ${record.score}`;
        easyRecordsList.appendChild(listItem);//Этот элемент добавляется в упорядоченный список (easyRecordsList).
    });
}

function saveRecord() {
    if (!nameEntered) {
        nameEntered = true;
        const difficultyLevel = "Average lvl"; 
        const playerName = prompt(`Вы установили новый рекорд (${difficultyLevel} уровень сложности)! Введите ваше имя:`);

        if (playerName) {
            const record = {
                name: `${playerName} (${difficultyLevel})`,
                score: score
            };
            const records = JSON.parse(localStorage.getItem("easyRecords")) || [];

            records.push(record);

            records.sort((a, b) => b.score - a.score);

            const limitedRecords = records.slice(0, 50);

            localStorage.setItem("easyRecords", JSON.stringify(limitedRecords));

            updateLeaderboard();
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (e.which === 37) {
        paddle.dx = -3;
    }
    else if (e.which === 39) {
        paddle.dx = 3;
    }

    if (ball.dx === 0 && ball.dy === 0 && e.which === 32) {
        ball.dx = ball.speed;
        ball.dy = -ball.speed;
    }
});
 
document.addEventListener('keyup', function(e){
    if (e.which === 37 || e.which === 39) {
        paddle.dx = 0;
    }
});

setInterval(draw, 10);

