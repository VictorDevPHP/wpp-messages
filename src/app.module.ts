import { Module } from '@nestjs/common';
import { WppConnectModule } from './wppconnect/wppconnect.module';

@Module({
  imports: [WppConnectModule],
})
export class AppModule {}
