import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Booking } from '../bookings/entities/book.entity';
import { CreateBookingDto } from './dtos/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) { }

  async create(createBookingData: CreateBookingDto & { userId: number }) {
    try {
      const isAvailable = await this.checkAvailability(
        new Date(createBookingData.startTime),
        new Date(createBookingData.endTime),
        createBookingData.resourceId,
      );

      if (!isAvailable) {
        throw new BadRequestException('Resource is already booked for this time slot');
      }

      const booking = this.bookingsRepository.create({
        ...createBookingData,
        status: 'pending',
        createdAt: new Date(),
        user: { id: createBookingData.userId }
      });


      return await this.bookingsRepository.save(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new BadRequestException(
        error.message || 'An error occurred while creating the booking',
      );
    }
  }

  async findByUserId(userId: number) {
    return this.bookingsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { startTime: 'DESC' },
    });
  }
  async checkAvailability(
    startTime: Date,
    endTime: Date,
    resourceId: number,
  ): Promise<boolean> {
    try {
      const conflictingBookings = await this.bookingsRepository.count({
        where: {
          resourceId,
          status: 'confirmed', // Only check confirmed bookings
          startTime: LessThanOrEqual(endTime), // Check for overlap
          endTime: MoreThanOrEqual(startTime), // Check for overlap
        },
      });

      // If no conflicting bookings exist, the time slot is available
      return conflictingBookings === 0;
    } catch (error) {
      console.error('Error checking availability:', error.message || error);
      throw new Error('Could not check availability. Please try again.');
    }
  }

  async findAll() {
    return this.bookingsRepository.find({
      relations: {
        user: true
      },
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: number) {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: {
        user: true
      }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async confirm(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }
    if (
      booking.status === 'confirmed'
    ) {
      throw new BadRequestException('Booking is already confirmed');
    }
   

    booking.status = 'confirmed';
    booking.updatedAt = new Date();
    return this.bookingsRepository.save(booking);
  }

  async cancel(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    booking.status = 'cancelled';
    return this.bookingsRepository.save(booking);
  }

}