import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class QRCode {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  data: string;
}