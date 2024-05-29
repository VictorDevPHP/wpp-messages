import { Module } from '@nestjs/common';
import { WppConnectModule } from './wppconnect/wppconnect.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    WppConnectModule,
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
