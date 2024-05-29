import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WppConnectService } from './wppconnect.service';
import { WppConnectController } from './wppconnect.controller';

@Module({
  imports: [ConfigModule],
  providers: [WppConnectService],
  controllers: [WppConnectController],
})
export class WppConnectModule {}