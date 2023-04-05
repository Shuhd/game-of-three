import { Test, TestingModule } from '@nestjs/testing';
import { GameOfThreeGateway } from './game-of-three.gateway';
import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '../../shared/dto/socket.dto';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';

describe('GameOfThreeGateway', () => {
  let app: INestApplication;
  let gateway: GameOfThreeGateway;
  let playerOne: Socket;
  let playerTwo: Socket;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [GameOfThreeGateway],
    }).compile();
    app = module.createNestApplication();
    await app.listen(3001);
    await app.init();
    playerOne = io('http://localhost:3001');
    playerTwo = io('http://localhost:3001');
    gateway = module.get<GameOfThreeGateway>(GameOfThreeGateway);
  });

  afterAll(() => {
    playerOne.disconnect();
    playerTwo.disconnect();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('Setting Players', () => {
    playerOne.on(SocketEvent.SET_PLAYER, (msg) => {
      expect(msg.playerId).toBeDefined();
    });

    playerTwo.on(SocketEvent.SET_PLAYER, (msg) => {
      expect(msg.playerId).toBeDefined();
    });
  });

  it('Start Game message should work', () => {
    playerOne.on('startGame', (msg) => {
      expect(msg).toBeDefined();
    });
  });

  it('Display initial number inserted by the user', () => {
    playerOne.emit(SocketEvent.INITIATE_NUMBER, 5);
    playerOne.on(SocketEvent.DISPLAY_NUMBER, (msg) => {
      expect(msg.number).toEqual(5);
    });
    playerTwo.on(SocketEvent.DISPLAY_NUMBER, (msg) => {
      expect(msg.number).toEqual(5);
    });
  });

  it('Display Number given by the user', () => {
    playerTwo.emit(SocketEvent.CALCULATE_NUMBER, {
      playerId: playerTwo.id,
      message: '',
      number: 1,
    });
    playerOne.on(SocketEvent.DISPLAY_NUMBER, (msg) => {
      expect(msg.number).toEqual(2);
    });
    playerTwo.on(SocketEvent.DISPLAY_NUMBER, (msg) => {
      expect(msg.number).toEqual(2);
    });
  });

  it('Display winner after number given by the user', () => {
    playerOne.emit(SocketEvent.CALCULATE_NUMBER, {
      playerId: playerOne.id,
      message: '',
      number: 1,
    });
    playerOne.on(SocketEvent.DISPLAY_NUMBER, (msg) => {
      expect(msg.number).toEqual(1);
    });
    playerTwo.on(SocketEvent.DISPLAY_NUMBER, (msg) => {
      expect(msg.number).toEqual(1);
    });
    playerOne.on(SocketEvent.DISPLAY_WINNER, (msg) => {
      expect(msg.number).toEqual(1);
    });
    playerTwo.on(SocketEvent.DISPLAY_WINNER, (msg) => {
      expect(msg).toEqual(1);
    });
  });
});
