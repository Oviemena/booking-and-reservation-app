import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Booking } from '../../bookings/entities/book.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: 'admin' | 'user' | 'staff';

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user, {
    cascade: true,
    eager:false
  })
  bookings: Booking[];
}
