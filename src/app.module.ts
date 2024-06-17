import { Module, OnModuleInit } from '@nestjs/common';
import { WppConnectModule } from './wppconnect/wppconnect.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WppConnectService } from './wppconnect/wppconnect.service';
import { QRCode } from 'src/entities/qrcode.entity/qrcode.entity';
import { GeminiAI } from './models/gemini-ai.entity';

@Module({
  imports: [
    WppConnectModule,
    TypeOrmModule.forFeature([QRCode, GeminiAI]), // Importe o TypeOrmModule para a entidade QRCode
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
  providers: [WppConnectService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly wppConnectService: WppConnectService) {}

  async onModuleInit() {
    const response = await this.wppConnectService.startAllSessions();
  }
}