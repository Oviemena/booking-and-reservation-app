import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/user.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        replication: {
          master: {
            host: configService.get('DATABASE_HOST'),
            port: configService.get('DATABASE_PORT'),
            username: configService.get('DATABASE_USER'),
            password: configService.get('DATABASE_PASSWORD'),
            database: configService.get('DATABASE_NAME'),
          },
          slaves: [{
            host: configService.get('DATABASE_SLAVE_HOST') ,
            port: configService.get('DATABASE_PORT'),
            username: configService.get('DATABASE_USER'),
            password: configService.get('DATABASE_PASSWORD'),
            database: configService.get('DATABASE_NAME'),
          }]
        },
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
        retryAttempts: 5,
        retryDelay: 3000,
        keepConnectionAlive: true,
        logging: true
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    BookingsModule,
    AuthModule
  ],
})
export class AppModule {}