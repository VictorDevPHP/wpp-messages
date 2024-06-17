import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiAI } from 'src/models/gemini-ai.entity';
import { GeminiService } from './gemini.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([GeminiAI])],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}