import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto/create-cart.dto';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';
import { Types } from 'mongoose';
import { Public } from 'src/decorator/custom';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Post('/create')
  async createCart(@Body() createCartDto: CreateCartDto) {
    return this.cartService.createCart(createCartDto);
  }

  @Public()
  @Post(':userId/add-to-cart')
  async addToCart(
    @Param('userId') userId: Types.ObjectId,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartService.addToCart(userId, createCartItemDto);
  }

  @Public()
  @Post(':userId/add-items')
  async addItems(
    @Param('userId') userId: Types.ObjectId,
    @Body() cartItems: CreateCartItemDto[],
  ) {
    return this.cartService.addItemsToCart(userId, cartItems);
  }

  @Public()
  @Post(':userId/remove-to-cart')
  async removeCartItem(
    @Param('userId') userId: Types.ObjectId,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartService.removeCartItem(userId, createCartItemDto);
  }
  @Public()
  @Post(':userId/checkout')
  async checkoutCart(@Param('userId') userId: Types.ObjectId) {
    return this.cartService.checkoutCart(userId);
  }

  @Public()
  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }
}
