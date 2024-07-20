import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerAssistant } from 'src/models/CustomerAssistants.entity';
import { OpenAiService } from 'src/api/openai/openai.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([CustomerAssistant])],
  providers: [OpenAiService],
  exports: [OpenAiService], 
})
export class OpenAiModule {}
