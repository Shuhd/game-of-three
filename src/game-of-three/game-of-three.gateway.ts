import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketEvent, SocketMessage } from '../../shared/dto/socket.dto';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class GameOfThreeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private playerOne: Socket | null = null;
  private playerTwo: Socket | null = null;
  private number: number | null = null;
  private logger: Logger = new Logger('GameOfThreeGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    if (!this.playerOne) {
      this.playerOne = client;
      this.playerOne.emit(SocketEvent.SET_PLAYER, {
        playerId: this.playerOne.id,
        message: 'You are player one',
      });
      if (this.playerTwo) this.waitForSecondPlayer();
      return;
    }
    if (!this.playerTwo) {
      this.playerTwo = client;
      this.playerTwo.emit(SocketEvent.SET_PLAYER, {
        playerId: this.playerTwo.id,
        message: 'You are player two',
      });
      this.playerOne.emit(
        SocketEvent.START_GAME,
        'another Player has joined, you can start by inserting random WHOLE NUMBER ONLY in the input!',
      );
      return;
    }
    client.emit(SocketEvent.MESSAGE, 'Game is already in progress');
    client.disconnect(true);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (client === this.playerOne) {
      this.playerOne = this.playerTwo ? this.playerTwo : null;
      this.number = null;
      this.playerTwo?.emit(SocketEvent.MESSAGE, 'Player one has left the game');
      this.playerTwo = null;
      this.playerOne?.emit(SocketEvent.SET_PLAYER, {
        playerId: this.playerOne.id,
        message: 'You are now player one',
      });
      return;
    }
    if (client === this.playerTwo) {
      this.playerTwo = null;
      this.number = null;
      this.playerOne?.emit(SocketEvent.MESSAGE, 'Player two has left the game');
    }
  }

  afterInit() {
    this.logger.log('Game Gateway initialized');
  }

  @SubscribeMessage(SocketEvent.INITIATE_NUMBER)
  handleStartGame(client: Socket, number: number) {
    this.number = number;

    this.server.emit(SocketEvent.DISPLAY_NUMBER, {
      number: this.number,
      msg: `Starting number is ${this.number}`,
    });

    this.playerTwo?.emit(SocketEvent.PLAY, {
      playerId: this.playerTwo?.id,
      message: `Starting number is ${this.number}`,
      number: this.number,
    });
  }

  @SubscribeMessage(SocketEvent.CALCULATE_NUMBER)
  handleCalculations(client: Socket, data: SocketMessage): void {
    if (this.number === null) {
      return;
    }

    const oldNumber = this.number;

    if (!this.isValidNumber(data.number)) {
      client.emit(
        SocketEvent.MESSAGE,
        'Invalid number choose another number to add',
      );
      return;
    }

    this.number = (this.number + data.number) / 3;
    this.server.emit(SocketEvent.DISPLAY_NUMBER, {
      number: this.number,
      msg: '',
    });

    if (this.isWinningPlayer(client, oldNumber, data.number)) {
      this.number = null;
      return;
    }

    this.server.emit(SocketEvent.PLAY, {
      playerId: this.getPlayerId(client),
      message: `(${oldNumber} + ${data.number}) / 3 = ${this.number}`,
      number: this.number,
    });
  }

  private getPlayerId(client: Socket): string {
    let playerId = null;
    if (client === this.playerOne) {
      playerId = this.playerTwo?.id;
    } else if (client === this.playerTwo) {
      playerId = this.playerOne?.id;
    }
    return playerId ? playerId : '';
  }

  private waitForSecondPlayer(): void {
    this.playerOne?.emit(
      SocketEvent.START_GAME,
      'another Player has joined, you can start by inserting a random WHOLE NUMBER ONLY in the input!',
    );
  }

  private isValidNumber(number: number): boolean {
    return (
      Number.isInteger(number) &&
      (this.number === null || (number + this.number) % 3 === 0)
    );
  }

  private isWinningPlayer(
    client: Socket,
    oldNumber: number,
    numbertoAdd: number,
  ): boolean {
    if (this.number === null) {
      return false;
    }

    const isWinningMove = this.number === 1;

    if (isWinningMove) {
      const winningText = `Congratulations You Won! ^_^ this was the winning move: (${oldNumber} + ${numbertoAdd}) / 3 = ${this.number}  `;
      const losingText = `Sorry You Lost! :(  this was the winning move: (${oldNumber} + ${numbertoAdd}) / 3 = ${this.number}  `;
      const msg1 = client === this.playerOne ? winningText : losingText;
      const msg2 = client === this.playerTwo ? winningText : losingText;
      this.playerTwo?.emit(SocketEvent.DISPLAY_WINNER, msg2);
      this.playerOne?.emit(SocketEvent.DISPLAY_WINNER, msg1);
    }

    return isWinningMove;
  }
}
