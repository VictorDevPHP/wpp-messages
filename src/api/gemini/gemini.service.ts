import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GeminiAI } from 'src/models/gemini-ai.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeminiService {
    constructor(
        private httpService: HttpService,
        @InjectRepository(GeminiAI)
        private geminiAIRepository: Repository<GeminiAI>,
    ) {}

    async startChat(sessionName: string) {
        const geminiAI = await this.geminiAIRepository.findOne({
            where: { session_name: sessionName },
            select: ['instruct'],
        });

        if (!geminiAI) {
            throw new Error(`Sessão não encontrada para: ${sessionName}`);
        }

        const instruction = geminiAI.instruct;
        return {
            sendMessageToAI: async (msg: string, sessionName: string) => {
                const geminiAI = await this.geminiAIRepository.findOne({ where: { session_name: sessionName } });
                if (!geminiAI) {
                    throw new Error(`Sessão não encontrada para: ${sessionName}`);
                }

                if (geminiAI.active === 'false') {
                    Logger.warn(`Geração de texto desativada para: ${sessionName}`);
                } else {
                    try {
                        const response = await firstValueFrom(this.httpService.post('http://'+process.env.PY_GEM_URL+'/gemini/generate', {
                            prompt: msg,
                            session: sessionName,
                            instruction: instruction,
                        }));
                        return response.data.response;
                    } catch (error) {
                        throw new HttpException('Failed to get response from Gemini AI', HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                }
            }
        };
    }
}