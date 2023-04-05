import { Module } from '@nestjs/common';
import { GameOfThreeGateway } from './game-of-three.gateway';

@Module({
  controllers: [],
  providers: [GameOfThreeGateway],
})
export class GameOfThreeModule {}
