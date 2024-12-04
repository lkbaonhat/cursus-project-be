// cart.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './entities/cart.entity';
import { CartItem, CartItemSchema } from './entities/cart-item.entity';
import { CartController } from './controller/cart.controller';
import { HistoryCartController } from './controller/cart-item.controller';
import { CartService } from './services/cart.service';
import { UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: CartItem.name, schema: CartItemSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
