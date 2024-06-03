import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QRCode } from '../models/qrCode.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WppConnectService } from './wppconnect.service';
import { WppConnectController } from './wppconnect.controller';

/**
 * Represents the WppConnect module.
 * This module is responsible for importing the necessary dependencies, providing the WppConnect service, and registering the WppConnect controller.
 */
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([QRCode])],
  providers: [WppConnectService],
  controllers: [WppConnectController],
})
export class WppConnectModule {}