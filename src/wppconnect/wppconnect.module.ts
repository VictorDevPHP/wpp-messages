import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QRCode } from '../models/qrCode.entity';
import { WppSessions } from 'src/models/wpp-sessions.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WppConnectService } from './wppconnect.service';
import { WppConnectController } from './wppconnect.controller';
import { GeminiModule } from 'src/api/gemini/gemini.module';
import { OpenAiModule } from 'src/api/openai/openai.module';
import { CustomerAssistant } from 'src/models/CustomerAssistants.entity';

/**
 * Represents the WppConnect module.
 * This module is responsible for importing the necessary dependencies, providing the WppConnect service, and registering the WppConnect controller.
 */
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([QRCode, WppSessions, CustomerAssistant]), GeminiModule, OpenAiModule],
  providers: [WppConnectService],
  controllers: [WppConnectController],
  exports: [GeminiModule, OpenAiModule],
})
export class WppConnectModule {}