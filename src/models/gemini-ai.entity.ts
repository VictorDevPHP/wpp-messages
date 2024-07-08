import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gemini_ai')
export class GeminiAI {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  customer_id: number;

  @Column({ type: 'text' })
  instruct: string;

  @Column({ type: 'varchar', length: 200 })
  session_name: string;

  @Column({ type: 'varchar', length: 50})
  active: string;
}