import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('connected_sessions')
export class WppSessions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  connected: boolean;

  @Column({ type: 'int', nullable: true })
  customer_id: number | null;

  @Column({ type: 'varchar', length: 255 })
  qrcode: string;

  @Column({ type: 'varchar', length: 255 })
  session_name: string;
}
