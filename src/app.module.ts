import { Module, OnModuleInit } from '@nestjs/common';
import { WppConnectModule } from './wppconnect/wppconnect.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WppConnectService } from './wppconnect/wppconnect.service';
import { QRCode } from 'src/entities/qrcode.entity/qrcode.entity';
import { GeminiAI } from './models/gemini-ai.entity';
import { WppSessions } from './models/wpp-sessions.entity';
import { createConnection } from 'typeorm';
import { CustomerAssistant } from './models/CustomerAssistants.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WppConnectModule,
    TypeOrmModule.forFeature([QRCode, GeminiAI, WppSessions, CustomerAssistant]),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        username: process.env.USER_NAME,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        entities: [__dirname + '/models/*.entity{.ts,.js}'],
        synchronize: true,
        extra: {
          connectionLimit: 10,
        },
        authPlugins: {
          mysql_native_password: 'mysql_native_password',
        },
      }),
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
