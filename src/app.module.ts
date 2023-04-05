import { Module } from '@nestjs/common';
import { GameOfThreeModule } from './game-of-three/game-of-three.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    GameOfThreeModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'static'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
