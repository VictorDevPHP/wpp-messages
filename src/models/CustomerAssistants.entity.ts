import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('customer_assistants')
export class CustomerAssistant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint' })
  customer_id: number;

  @Column({ type: 'varchar', length: 255 })
  id_assistant: string;

  @Column({ type: 'tinyint', width: 1 })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  session_name: string;
}
