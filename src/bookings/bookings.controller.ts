import { Controller, Post, Body, Req, UseGuards, BadRequestException, Get, Param, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dtos/create-booking.dto';


interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  }
}

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.id;
    console.log(userId)
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.bookingsService.create({
      ...createBookingDto,
      userId
    });
  }

  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('my-bookings')
  async findMyBookings(@Req() req: RequestWithUser) {
    return this.bookingsService.findByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Post(':id/confirm')
  async confirm(@Param('id') id: string, @Req() req: RequestWithUser) {
    const booking = await this.bookingsService.findOne(+id);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status === 'confirmed' && booking.user.id !== req.user.id) {
      throw new BadRequestException('Resource is already booked by another user');
    }
    // Check if another booking is already confirmed for this resource and time
    const isAvailable = await this.bookingsService.checkAvailability(
      booking.startTime,
      booking.endTime,
      booking.resourceId
    );

    if (!isAvailable) {
      throw new BadRequestException('Resource is already booked for this time slot');
    }

    return this.bookingsService.confirm(+id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: RequestWithUser) {
    const booking = await this.bookingsService.findOne(+id);

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    // Allow cancellation only for booking owner or admin
    if (booking.user.id !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to cancel this booking');
    }

    if (booking.status !== 'confirmed') {
      throw new BadRequestException('Can only cancel confirmed bookings');
    }

    return this.bookingsService.cancel(+id);
  }
}