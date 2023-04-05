export enum SocketEvent {
  SET_PLAYER = 'setPlayer',
  START_GAME = 'startGame',
  INITIATE_NUMBER = 'initiateNumber',
  MESSAGE = 'message',
  PLAY = 'play',
  CALCULATE_NUMBER = 'calculateNumber',
  DISPLAY_NUMBER = 'displayNumber',
  DISPLAY_WINNER = 'displayWinner',
}

interface DefaultSocketMessageDto {
  playerId: string;
  message: string;
}

interface GameFlow extends DefaultSocketMessageDto {
  number: number;
}

export type SocketMessage = GameFlow;
