import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WppConnectService } from './wppconnect.service';
import { WppConnectController } from './wppconnect.controller';

/**
 * Represents the WppConnect module.
 * This module is responsible for importing the necessary dependencies, providing the WppConnect service, and registering the WppConnect controller.
 */
@Module({
  imports: [ConfigModule],
  providers: [WppConnectService],
  controllers: [WppConnectController],
})
export class WppConnectModule {}