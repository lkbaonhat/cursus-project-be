// history-cart.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { CartItemService } from '../services/cart-item.service';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';

@Controller('history-cart')
export class HistoryCartController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Post('/create')
  createHistoryCart(@Body() createCartItemtDto: CreateCartItemDto) {
    return this.cartItemService.createCartItem(createCartItemtDto);
  }

  @Get(':cartId')
  getHistoryCartByCartId(@Param('cartId') cartId: string) {
    return this.cartItemService.getCartItemCartId(cartId);
  }
}
