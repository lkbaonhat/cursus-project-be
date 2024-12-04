// history-cart.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartItem } from '../entities/cart-item.entity';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';

@Injectable()
export class CartItemService {
  constructor(
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
  ) {}

  async createCartItem(
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartItem> {
    const createdCartItem = new this.cartItemModel(createCartItemDto);
    return createdCartItem.save();
  }

  async getCartItemCartId(cartId: string): Promise<CartItem | null> {
    return await this.cartItemModel.findById(cartId);
  }


}
