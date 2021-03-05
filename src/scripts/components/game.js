/* eslint class-methods-use-this: ["error", { "exceptMethods": [
  "createFieldModel", "findPosition", "defineMoveDirection"
] }] */

import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import Chip from './chip';
import createNode from '../utils';

export default class Game {
  constructor(parent, config) {
    this.config = config;

    this.controlPanel = createNode(parent, this.config.CONTROL_PANEL_CN);
    this.btnContainer = createNode(this.controlPanel, this.config.BTN_CONTAINER_CN);
    this.autoBtn = createNode(this.btnContainer, this.config.AC_BTN_CN, 'Autocomplete', 'button');
    this.ngBtn = createNode(this.btnContainer, this.config.N_G_BTN_CN, 'New Game', 'button');
    this.timerMovesContainer = createNode(this.controlPanel, this.config.TIMER_AND_MOVES_CONT_CN);
    this.movesCounter = createNode(this.timerMovesContainer, this.config.MOVES_COUNTER_CN);
    this.timer = createNode(this.timerMovesContainer, this.config.TIMER_CN);

    this.container = createNode(parent, this.config.FIELD_CONTAINER_CN);
    this.finalScreen = createNode(this.container, this.config.FINAL_SCREEN_CN);
    this.finalScreen.style.display = 'none';
    this.field = createNode(this.container, this.config.FIELD_CN);

    this.ngBtn.onclick = () => {
      this.startNewGame();
      this.autoBtn.disabled = false;
    };

    this.autoBtn.onclick = () => {
      this.autocompleteGame();
      this.autoBtn.disabled = true;
    };

    this.eventOnFieldClick = (e) => {
      const chip = this.chips.find((item) => item.node.textContent === e.target.textContent);
      const emptyChip = this.chips.find((item) => item.node.textContent === '0');

      if (chip && emptyChip) {
        const chipPosition = this.findPosition(this.fieldModel, chip.node.textContent);
        const emptyChipPosition = this.findPosition(this.fieldModel, 0);
        const moveDirection = this.defineMoveDirection(chipPosition, emptyChipPosition);

        if (moveDirection) {
          this.updateFieldModel(chipPosition, emptyChipPosition);
          this.solutionList.push(cloneDeep(this.fieldModel));
          chip.addAnimation(moveDirection, this.config.ANIMATION_DURATION);
          this.field.removeEventListener('click', this.eventOnFieldClick);
          this.optimizeSolutionList();
          chip.node.ontransitionend = () => {
            this.movesCount += 1;
            this.movesCounter.textContent = this.movesCount;
            chip.removeAnimation();
            this.switchOrder(chip, emptyChip);
            this.field.addEventListener('click', this.eventOnFieldClick);
            this.isGameOver();
          };
        }
      }
    };
  }

  startNewGame() {
    this.setFieldTemplate(this.config.FIELD_SIZE);

    if (this.timerID) this.stopTimer();

    if (this.chips && this.chips.length) {
      this.chips.forEach((item) => item.node.remove());
    }

    this.fieldModel = this.createFieldModel(this.config.FIELD_SIZE);

    if (!this.solutionList || this.solutionList.length) {
      this.solutionList = [];
    }
    this.solutionList.push(cloneDeep(this.fieldModel));

    this.movesCount = 0;
    this.movesCounter.textContent = this.movesCount;

    this.mixFieldModel().createChips();
    this.isAutoComplete = false;
    this.isAutoCompletingStopped = false;
    this.field.addEventListener('click', this.eventOnFieldClick);

    this.finalScreen.style.display = 'none';
    this.startTimer();
    this.timer.textContent = '00 : 00 : 00';

    return this;
  }

  mixFieldModel() {
    const moveList = ['up', 'down', 'left', 'right'];
    while (this.solutionList.length <= this.config.NUMBER_OF_MIXING) {
      const randomNum = Math.floor(Math.random() * moveList.length);
      const zeroPosition = this.findPosition(this.fieldModel, 0);
      if (
        (moveList[randomNum] === 'up' && zeroPosition.row > 0) ||
        (moveList[randomNum] === 'down' && zeroPosition.row < this.config.FIELD_SIZE - 1) ||
        (moveList[randomNum] === 'left' && zeroPosition.col > 0) ||
        (moveList[randomNum] === 'right' && zeroPosition.col < this.config.FIELD_SIZE - 1)
      ) {
        this.switchChipsNumber(moveList[randomNum], zeroPosition);
        this.solutionList.push(cloneDeep(this.fieldModel));
        this.optimizeSolutionList();
      }
    }
    return this;
  }

  createChips() {
    this.chips = [];
    let order = 1;
    for (let i = 0; i < this.fieldModel.length; i += 1) {
      for (let j = 0; j < this.fieldModel[i].length; j += 1) {
        this.chips.push(new Chip(this.field, this.config, this.fieldModel[i][j], order));
        order += 1;
      }
    }
    return this;
  }

  startTimer() {
    this.startTime = new Date();

    this.timerID = setInterval(() => {
      const nowTime = new Date();
      const time = nowTime - this.startTime;
      const hours = Math.floor(time / 3600000);
      const minutes = Math.floor((time - hours * 3600000) / 60000);
      const seconds = Math.floor((time - minutes * 60000 - hours * 3600000) / 1000);

      const addZero = (num) => (num < 10 ? `0${num}` : num);

      this.timer.textContent = `${addZero(hours)} : ${addZero(minutes)} : ${addZero(seconds)}`;
    }, 1000);

    return this;
  }

  stopTimer() {
    clearInterval(this.timerID);
    return this;
  }

  isGameOver() {
    const model = this.createFieldModel(this.config.FIELD_SIZE);
    if (isEqual(model, this.fieldModel)) {
      this.stopTimer();
      this.autoBtn.disabled = true;
      this.finalScreen.style.display = 'flex';
      if (this.isAutoComplete) {
        this.finalScreen.innerHTML = `
          <h2 class=${this.config.FINAL_SCREEN_MESSAGE_CN}>Game over</h2>
        `;
      } else {
        this.finalScreen.innerHTML = `
          <h2 class=${this.config.FINAL_SCREEN_MESSAGE_CN}>You win!!!</h2>
          <p class=${this.config.FINAL_SCREEN_TIMER_CN}>Time: ${this.timer.textContent}</p>
          <p class=${this.config.FINAL_SCREEN_MOVES_CN}>Moves: ${this.movesCount}</p>
        `;
      }
    }
    return this;
  }

  autocompleteGame() {
    this.field.removeEventListener('click', this.eventOnFieldClick);
    this.solutionList.pop();
    this.isAutoComplete = true;

    const cycle = () => {
      if (this.solutionList.length > 0) {
        const posFrom = this.findPosition(this.fieldModel, 0);
        const posTo = this.findPosition(this.solutionList[this.solutionList.length - 1], 0);
        const chip = this.chips.find(
          (item) => item.node.textContent === String(this.fieldModel[posTo.row][posTo.col])
        );
        const emptyChip = this.chips.find((item) => item.node.textContent === '0');
        const moveDirection = this.defineMoveDirection(posTo, posFrom);
        chip.addAnimation(moveDirection, this.config.ANIMATION_DURATION);
        this.fieldModel = this.solutionList.pop();

        chip.node.ontransitionend = () => {
          this.movesCount += 1;
          this.movesCounter.textContent = this.movesCount;
          chip.removeAnimation();
          this.switchOrder(chip, emptyChip);
          this.isGameOver();
          if (!this.isAutoCompletingStopped) {
            cycle();
          }
        };
      }
    };
    cycle();
    return this;
  }

  switchOrder(chip, emptyChip) {
    const chipOrder = chip.node.style.order;
    const emptyChipOrder = emptyChip.node.style.order;
    chip.setOrder(emptyChipOrder);
    emptyChip.setOrder(chipOrder);
    return this;
  }

  setFieldTemplate(fieldSize) {
    this.field.style.gridTemplateColumns = `repeat(${fieldSize}, 1fr)`;
    this.field.style.gridTemplateRows = `repeat(${fieldSize}, 1fr)`;
    return this;
  }

  updateFieldModel(chipPosition, emptyChipPosition) {
    const chipValue = this.fieldModel[chipPosition.row][chipPosition.col];
    const emptyChipValue = this.fieldModel[emptyChipPosition.row][emptyChipPosition.col];

    this.fieldModel[chipPosition.row][chipPosition.col] = emptyChipValue;
    this.fieldModel[emptyChipPosition.row][emptyChipPosition.col] = chipValue;

    return this;
  }

  stopAutoComplete() {
    this.isAutoCompletingStopped = true;
    return this;
  }

  optimizeSolutionList() {
    for (let i = 0; i < this.solutionList.length; i += 1) {
      if (isEqual(this.solutionList[i], this.solutionList[this.solutionList.length - 1])) {
        this.solutionList.splice(i + 1, this.solutionList.length - i + 1);
        break;
      }
    }
    return this;
  }

  switchChipsNumber(move, { row, col }) {
    const model = this.fieldModel;
    if (move === 'up') {
      [model[row - 1][col], model[row][col]] = [model[row][col], model[row - 1][col]];
    } else if (move === 'down') {
      [model[row + 1][col], model[row][col]] = [model[row][col], model[row + 1][col]];
    } else if (move === 'left') {
      [model[row][col - 1], model[row][col]] = [model[row][col], model[row][col - 1]];
    } else if (move === 'right') {
      [model[row][col + 1], model[row][col]] = [model[row][col], model[row][col + 1]];
    }
    return this;
  }

  defineMoveDirection(pos, zeroPos) {
    if (pos.row === zeroPos.row - 1 && pos.col === zeroPos.col) {
      return 'up';
    } else if (pos.row === zeroPos.row + 1 && pos.col === zeroPos.col) {
      return 'down';
    } else if (pos.row === zeroPos.row && pos.col === zeroPos.col - 1) {
      return 'left';
    } else if (pos.row === zeroPos.row && pos.col === zeroPos.col + 1) {
      return 'right';
    }
    return false;
  }

  createFieldModel(fieldSize) {
    const arr = [];
    let num = 1;
    for (let i = 0; i < fieldSize; i += 1) {
      const arr2 = [];
      for (let j = 0; j < fieldSize; j += 1) {
        arr2.push(num);
        num += 1;
      }
      arr.push(arr2);
    }
    arr[arr.length - 1][arr.length - 1] = 0;
    return arr;
  }

  findPosition(fieldModel, num) {
    let row = null;
    let col = null;
    for (let i = 0; i < fieldModel.length; i += 1) {
      for (let j = 0; j < fieldModel[i].length; j += 1) {
        if (fieldModel[i][j] === +num) {
          row = i;
          col = j;
        }
      }
    }
    return { row, col };
  }
}
