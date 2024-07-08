import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiAI } from 'src/models/gemini-ai.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GeminiService {
    constructor(
        private httpService: HttpService,
        @InjectRepository(GeminiAI)
        private geminiAIRepository: Repository<GeminiAI>,
    ){}

    async startChat(history: {role: string, text: string}[]) {
        const genAI = new GoogleGenerativeAI(process.env.GEM_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const chat = model.startChat({
            history: history.map(message => ({
                role: message.role,
                parts: message.text ? [{ text: message.text }] : [{ text: ' ' }],
            })),
            generationConfig: {
                maxOutputTokens: 100,
            },
        });

        return {
            sendMessageToAI: async (msg: string, sessionName: string) => {
                const geminiAI = await this.geminiAIRepository.findOne({ where: { session_name: sessionName } });
                if (!geminiAI) {
                    throw new Error(`Sessão não encontrada para: ${sessionName}`);
                }
                
                if(geminiAI.active == 'false'){
                    throw new Error (`Geração de texto desativada para: ${sessionName}`)
                }else{
                    const instruction = geminiAI.instruct;
                    const result = await chat.sendMessage(instruction + ': ' + msg);
                    const response = await result.response;
                    const text = response.text();
                    return text;
                }
            }
        };
    }
}