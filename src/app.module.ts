import { Module } from '@nestjs/common';
import { WppConnectModule } from './wppconnect/wppconnect.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    WppConnectModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'laravel_11_app',
      entities: [__dirname + '/models/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
