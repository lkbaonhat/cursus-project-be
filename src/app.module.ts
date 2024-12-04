import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { CacheModule } from '@nestjs/cache-manager';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/category/sub-category.module';
import { CourseModule } from './modules/course/course.module';
import * as redisStore from 'cache-manager-redis-store';
import { SlugService } from './utils/slug.service';
import { OrderModule } from './modules/order/order.module';
import * as Handlebars from 'handlebars';
import * as moment from 'moment';

Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
  return moment(date).format(format);
});

Handlebars.registerHelper('formatPrice', (price: number) => {
  return price.toLocaleString('vi-VN');
});
import { CartModule } from './modules/cart/cart.module';
import { ReviewModule } from './modules/review/review.module';
import { AnalyticsModule } from './google/analytic/analytics.module';

@Module({
  imports: [
    CartModule,
    OrderModule,
    CategoryModule,
    SubCategoryModule,
    CourseModule,
    UserModule,
    AuthModule,
    ReviewModule,
    AnalyticsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: './dist/mail/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: 300,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    SlugService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [SlugService],
})
export class AppModule { }
