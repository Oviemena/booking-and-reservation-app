import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  status: 'pending' | 'confirmed' | 'cancelled';

  
  @ManyToOne(() => User, (user) => user.bookings, {
    onDelete: 'CASCADE',
    eager: true
  })
  user: User;


  @Column()
  resourceId: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}