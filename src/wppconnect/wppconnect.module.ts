import { Module } from '@nestjs/common';
import { WppConnectService } from './wppconnect.service';
import { WppConnectController } from './wppconnect.controller';

@Module({
  providers: [WppConnectService],
  controllers: [WppConnectController],
})
export class WppConnectModule {}
