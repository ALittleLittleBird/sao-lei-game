let width = 30;

class GameCeil {
  el
  self
  x //所在行
  y //所在列
  type //是否是炸弹
  nearBombNum //附近炸弹数
  hasMask //是否点开
  mask
  flag

  constructor(el, x, y, type = "null") {
    this.self = document.createElement("li")
    this.self.className = "GameCeil"
    this.self.style.height = width + "px";
    this.self.style.width = width + "px";
    this.self.class = this;
    this.el = el
    this.el.appendChild(this.self);

    this.x = x;
    this.y = y;
    this.type = type;
    this.nearBombNum = 0;
    this.hasMask = true;

    if (this.type == "bomb") this.toBomb();

    this.mask = document.createElement("div");
    this.mask.className = "mask";
    this.self.appendChild(this.mask);

    this.flag = document.createElement("img");
    this.flag.src = "./imgs/static/flag.png";
    this.flag.style.display = "none";
    this.flag.className = "flag";
    this.mask.appendChild(this.flag);
  }

  toBomb() {
    this.type = "bomb";
    let img = document.createElement("img");
    img.src = "./imgs/static/bomb.png"
    this.self.appendChild(img);
  }

  incNearBombNum() {
    if (this.type != "bomb") {
      this.type = "number";
      if (this.nearBombNum) {
        this.nearBombNum++;
        let span = this.self.getElementsByTagName("span")[0];
        span.innerText = parseInt(span.innerText) + 1;
      } else {
        let span = document.createElement("span");
        this.nearBombNum = 1;
        span.innerHTML = 1;
        this.self.appendChild(span);
      }
    }
  }

  removeMask() {
    this.mask.remove();
    this.hasMask = false;
  }

  toggleFlag() {
    // console.log("toggleFlage");
    if (this.flag.style.display == "none") {
      this.flag.style.display = "block";
    } else {
      this.flag.style.display = "none";
    }
  }
}

class GameArea {
  el
  self
  row
  col
  gameCeils
  bombNum
  bombs

  constructor(el, row = 10, bombNum = 10, col = row) {
    this.self = document.createElement("ul")
    this.self.className = "GameArea clearfix";
    this.self.style.width = width * row + "px";
    this.self.style.lineHeight = width - 4 + "px";
    this.self.class = this;
    this.el = el
    this.el.appendChild(this.self);

    this.row = row;
    this.col = col;
    this.bombNum = bombNum;

    //生成空gameCeil
    this.gameCeils = [];
    for (let i = 0; i < row; i++) {
      let aRowGameCeils = []
      for (let j = 0; j < col; j++) {
        let gameCeil = new GameCeil(this.self, i, j);
        aRowGameCeils.push(gameCeil);
      }
      this.gameCeils.push(aRowGameCeils);
    }

    // 生成炸弹位置集合
    let indexes = new Set();
    while (indexes.size < this.bombNum) {
      indexes.add(Math.floor(Math.random() * col * row));
    }

    let positions = [];
    for (let index of indexes) {
      let x = index % col;
      let y = Math.floor(index / col);
      let position = {
        x,
        y
      };
      positions.push(position);
    }

    //生成炸弹
    this.bombs = [];
    for (let position of positions) {
      this.gameCeils[position.x][position.y].toBomb();
      this.bombs.push(this.gameCeils[position.x][position.y]);
    }

    //生成炸弹周围数字
    for (let bomb of this.bombs) {
      let neighbours = this.getNeighbours(bomb);
      neighbours.forEach(n => {
        n.incNearBombNum()
      })
    }
  }

  toBomb(x, y) {
    this.gameCeils[x][y].toBomb();
  }

  getNeighbours(gameCeil) {
    let x = gameCeil.x;
    let y = gameCeil.y;
    let neighbours = [];
    if (x > 0) {
      neighbours.push(this.gameCeils[x - 1][y]);
    }
    if (x > 0 && y < this.row - 1) {
      neighbours.push(this.gameCeils[x - 1][y + 1]);
    }
    if (y < this.col - 1) {
      neighbours.push(this.gameCeils[x][y + 1])
    }
    if (x < this.col - 1 && y < this.row - 1) {
      neighbours.push(this.gameCeils[x + 1][y + 1])
    }
    if (x < this.row - 1) {
      neighbours.push(this.gameCeils[x + 1][y])
    }
    if (x < this.row - 1 && y > 0) {
      neighbours.push(this.gameCeils[x + 1][y - 1])
    }
    if (y > 0) {
      neighbours.push(this.gameCeils[x][y - 1])
    }
    if (x > 0 && y > 0) {
      neighbours.push(this.gameCeils[x - 1][y - 1])
    }
    return neighbours
  }
}

class SaoLeiGame {
  el //挂载点
  self //自身DOM元素
  row //游戏行数
  col //游戏列数
  bombNum //游戏炸弹数
  gameArea //游戏表格区域
  restartBtn //重启游戏按钮
  left //还有多少个格子未被翻开
  changeRow //改变行数的input
  changeBombNum //改变炸弹数的input

  constructor(el, row = 10, bombNum = 10, col = row) {
    //创建自身DOM，并将其添加属性obj，obj指向该DOM代表的对象
    this.self = document.createElement("div")
    this.self.className = "SaoLeiGame";
    this.self.class = this;
    this.el = el
    this.el.appendChild(this.self);

    this.row = row
    this.bombNum = bombNum
    this.col = col;
    this.left = row * col;

    this.gameArea = new GameArea(this.self, this.row, this.bombNum);

    this.gameArea.self.addEventListener("click", this.clickHandler);

    this.gameArea.self.addEventListener("contextmenu", this.mouse2ClickHandler);

    this.restartBtn = document.createElement("button");
    this.restartBtn.innerText = "restart";
    this.restartBtn.addEventListener("click", this.restart);
    this.self.appendChild(this.restartBtn);

    this.changeRow = document.createElement("div");
    this.changeRow.innerHTML = `<i class='info'>行数：</i><input class='inputRow' value='${this.row}'/>`
    this.changeRow.className = "changeRow";
    this.changeRow.addEventListener("change", this.changeRowHandler);
    this.self.appendChild(this.changeRow);
    this.changeBombNum = document.createElement("div");
    this.changeBombNum.innerHTML = `<i class='info'>炸弹数：</i><input class='inputBombNum' value='${this.bombNum}'/>`
    this.changeBombNum.className = "changeBombNum";
    this.changeBombNum.addEventListener("change", this.changeBombNumHandler);
    this.self.appendChild(this.changeBombNum);
  }

  mouse2ClickHandler = e => {
    if (e.target.className === "mask" || e.target.className === "flag") {
      let gameCeil = e.target.className == "mask" ? e.target.parentNode.class : e.target.parentNode.parentNode.class;
      // console.log("run");
      gameCeil.toggleFlag();
    }
  }

  clickHandler = e => {
    if (e.target.className === "mask" || e.target.className === "flag") {
      let gameCeil = e.target.className == "mask" ? e.target.parentNode.class : e.target.parentNode.parentNode.class;
      gameCeil.removeMask();
      if (gameCeil.type == "bomb") this.lose();
      else {
        if (gameCeil.type == "null") this.clickNearSafeGameCeils(gameCeil);
        this.isSuccess();
      }
    }
  }

  isSuccess() {
    if (this.self.getElementsByClassName("mask").length == this.bombNum) {
      let winMessage = document.createElement("div");
      winMessage.className = "win";
      winMessage.innerHTML = "You Win!"
      this.gameArea.self.appendChild(winMessage);
      this.gameArea.self.removeEventListener("click", this.clickHandler)
    }
  }

  clickNearSafeGameCeils(gameCeil) {
    let unclickedNeighbours = this.gameArea.getNeighbours(gameCeil).filter(n => {
      return n.hasMask;
    });
    unclickedNeighbours.forEach(n => {
      n.removeMask();
      if (n.type == "null") {
        this.clickNearSafeGameCeils(n);
      }
    });

    while (unclickedNeighbours.length) {
      let unclickedGameCeil = unclickedNeighbours.pop();
      unclickedGameCeil.removeMask();
      this.left--;
      // console.log(this.left);
      if (unclickedGameCeil.type == "null") {
        unclickedNeighbours.push(...this.gameArea.getNeighbours(unclickedGameCeil).filter(n => {
          return n.hasMask;
        }))
      }
    }
  }

  lose() {
    let loseMessage = document.createElement("div");
    loseMessage.className = "lose";
    loseMessage.innerHTML = "You Lose!"
    this.gameArea.self.appendChild(loseMessage);
    this.gameArea.self.removeEventListener("click", this.clickHandler)
    this.gameArea.self.removeEventListener("click", this.clickHandler)
  }

  restart = () => {
    this.gameArea.self.remove();
    this.gameArea = new GameArea(this.self, this.row, this.bombNum);
    this.self.insertBefore(this.gameArea.self, this.restartBtn);
    this.gameArea.self.addEventListener("click", this.clickHandler);
    this.gameArea.self.addEventListener("contextmenu", this.mouse2ClickHandler);
  }

  changeRowHandler = e => {
    let newRow = parseInt(e.target.value);
    if (newRow) {
      if (newRow > 30) newRow = 30
      else if (newRow < 1) newRow = 1;
      this.row = newRow
      this.col = this.row;
      if (this.bombNum > this.row * this.col) {
        // console.log("gt");
        this.bombNum = this.row * this.col;
        this.changeBombNum.getElementsByClassName("inputBombNum")[0].value = this.bombNum;
      }
      this.changeRow.getElementsByClassName("inputRow")[0].value = this.row;
      this.restart();
    }
  }

  changeBombNumHandler = e => {
    let newBombNum = parseInt(e.target.value);
    if (newBombNum) {
      if (newBombNum > this.row * this.col) {
        newBombNum = this.row * this.col;
      } else if(newBombNum < 0) {
        newBombNum = 0;
      }
      this.bombNum = newBombNum

      this.changeBombNum.getElementsByClassName("inputBombNum")[0].value = this.bombNum;
      this.restart();
    }
  }


}

let app = document.getElementById("app");
let newGame = new SaoLeiGame(app, 10, 10);