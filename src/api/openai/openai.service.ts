import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerAssistant } from 'src/models/CustomerAssistants.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OpenAiService {
  constructor(
    private httpService: HttpService,
    @InjectRepository(CustomerAssistant)
    private customerAssistantRepository: Repository<CustomerAssistant>,
  ) {}

  async isAssistantActive(sessionName: string): Promise<boolean> {
    const assistant = await this.customerAssistantRepository.findOne({
      where: { session_name: sessionName },
      select: ['active'],
    });

    return assistant ? assistant.active : false;
  }

  async createThread(number, sessionName, msg) {
    Logger.debug('Criando thread');

    const url = 'http://'+process.env.API_OPENAI+'/openai/createThread';
    console.log(url);
    
    const body = {
      session_name: sessionName,
      number: number,
    };

    try {
        const response = await firstValueFrom(
            this.httpService.post(url, body, {
              headers: {
                'Content-Type': 'application/json', 
              },
            })
          );

      Logger.debug('Thread criada com sucesso:', response.data);
      const textMessage = await this.sendMessage(number, msg);
      console.log(textMessage.message);
           
      return textMessage.message;
    } catch (error) {
      Logger.error('Erro ao criar thread:', error.message);
      throw new Error('Não foi possível criar a thread.');
    }
  }

  async sendMessage(number, message) {
    Logger.debug('Enviando mensagem');

    const url = 'http://'+process.env.API_OPENAI+'/openai/sendMessage';

    const body = {
      number: number,
      message: message,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body)
      );

      Logger.debug('Mensagem enviada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      Logger.error('Erro ao enviar mensagem:', error.message);
      throw new Error('Não foi possível enviar a mensagem.');
    }
  }
}
