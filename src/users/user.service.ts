import { Injectable, ConflictException,  NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
            createdAt: new Date(),
        });

        const savedUser = await this.usersRepository.save(user);
        const { password, ...result } = savedUser;
        return result;
    }
    async findAll() {
        return this.usersRepository.find({
            relations: ['bookings'],
        });
    }

    async findOne(userId: number): Promise<User | null>  {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['bookings'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
        }) ?? null;
    }
}
