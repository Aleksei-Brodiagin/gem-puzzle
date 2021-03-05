import './styles/main.scss';

import Game from './scripts/components/game';
import config from './scripts/config';

const game = new Game(document.body, config);
game.startNewGame();
