import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('qrcodes')
export class QRCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  qrCode: string;

  @Column({ type: 'text' })
  session: string;
}