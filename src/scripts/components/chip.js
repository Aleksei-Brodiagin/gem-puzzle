import createNode from '../utils';

export default class Chip {
  constructor(parent, config, chipNum, order, bgImage = 0) {
    this.config = config;

    const chipName = this.config.CHIP_CN;
    const emptyName = this.config.EMPTY_CHIP_CN;
    const className = chipNum ? chipName : `${chipName} ${emptyName}`;

    this.node = createNode(parent, className, chipNum);

    const fs = this.config.FIELD_SIZE;
    const bgPos = `-${((chipNum - 1) % fs) * 100}% -${Math.floor((chipNum - 1) / fs) * 100}%`;
    const imagesList = this.config.BG_IMAGES_LIST;

    this.node.style.backgroundPosition = bgPos;
    this.node.style.backgroundSize = `${100 * fs}%`;
    this.node.style.backgroundImage = chipNum ? imagesList[bgImage] : null;

    this.setOrder(order);
  }

  setOrder(order) {
    this.node.style.order = order;
    return this;
  }

  addAnimation(moveDirection, animationDuration) {
    this.node.style.transition = `${animationDuration}s`;

    const moves = ['up', 'down', 'left', 'right'];
    const animations = ['moveDown', 'moveUp', 'moveRight', 'moveLeft'];

    for (let i = 0; i < moves.length; i += 1) {
      if (moveDirection === moves[i]) {
        this.node.classList.add(animations[i]);
      }
    }

    return this;
  }

  removeAnimation() {
    this.node.style.transition = '';

    ['moveDown', 'moveUp', 'moveLeft', 'moveRight'].forEach((item) => {
      this.node.classList.remove(item);
    });

    return this;
  }
}
