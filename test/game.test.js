import Game from '../src/scripts/components/game';
import config from '../src/scripts/config';

describe('Game:', () => {
  const arr1 = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0],
  ];

  test('createFieldModel work correctly', () => {
    expect(new Game(document.body, config).createFieldModel(4)).toEqual(arr1);
  });

  test('findPosition work correctly', () => {
    expect(new Game(document.body, config).findPosition(arr1, 3)).toEqual({ row: 0, col: 2 });
    expect(new Game(document.body, config).findPosition(arr1, 0)).toEqual({ row: 3, col: 3 });
  });

  test('defineMoveDirection work correctly', () => {
    expect(
      new Game(document.body, config).defineMoveDirection({ row: 2, col: 3 }, { row: 3, col: 3 })
    ).toBe('up');
    expect(
      new Game(document.body, config).defineMoveDirection({ row: 3, col: 2 }, { row: 2, col: 2 })
    ).toBe('down');
    expect(
      new Game(document.body, config).defineMoveDirection({ row: 1, col: 1 }, { row: 1, col: 2 })
    ).toBe('left');
    expect(
      new Game(document.body, config).defineMoveDirection({ row: 0, col: 3 }, { row: 0, col: 2 })
    ).toBe('right');
  });
});
