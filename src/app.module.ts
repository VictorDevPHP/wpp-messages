import { Module, OnModuleInit } from '@nestjs/common';
import { WppConnectModule } from './wppconnect/wppconnect.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WppConnectService } from './wppconnect/wppconnect.service';
import { QRCode } from 'src/entities/qrcode.entity/qrcode.entity';
import { GeminiAI } from './models/gemini-ai.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WppConnectModule,
    TypeOrmModule.forFeature([QRCode, GeminiAI]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST,
      port: 3306,
      username: process.env.USER_NAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      entities: [__dirname + '/models/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
  providers: [WppConnectService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly wppConnectService: WppConnectService) {}

  async onModuleInit() {
    const response = await this.wppConnectService.startAllSessions();
  }
}