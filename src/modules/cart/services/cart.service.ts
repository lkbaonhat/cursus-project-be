import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from '../entities/cart.entity';
import { CreateCartDto } from '../dto/create-cart.dto';
import { CreateCartItemDto } from '../dto/create-cart-item.dto';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
  ) {}

  async createCart(createCartDto: CreateCartDto): Promise<Cart> {
    const { userId } = createCartDto;
    const cart = await this.cartModel.findOne({ userId });
    if (cart) {
      throw new NotFoundException('Cart already exist');
    }
    const newCart = new this.cartModel(createCartDto);
    return newCart.save();
  }

  async addToCart(
    userId: Types.ObjectId,
    createCartItemDto: CreateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException('Cart not found');

    const { ...payload } = createCartItemDto;

    const courseExists = cart.cartItems.find(
      (item) => item.courseId.toString() === payload.courseId.toString(),
    );

    if (courseExists) {
      courseExists.isDeleted = false;
    } else {
      cart.cartItems.push(createCartItemDto as any);
    }

    await cart.save();
    return cart;
  }

  async addItemsToCart(
    userId: Types.ObjectId,
    cartItemsFromFrontEnd: CreateCartItemDto[],
  ): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).populate('cartItems');
    if (!cart) throw new NotFoundException('Cart not found');
    if (cartItemsFromFrontEnd.length === 0) {
      return cart;
    }

    for (const newCartItemDto of cartItemsFromFrontEnd) {
      if (!newCartItemDto.courseId) {
        throw new NotFoundException('courseId is required in the request body');
      }

      const existingCartItem = cart.cartItems.find((item) => {
        if (item.courseId && newCartItemDto.courseId) {
          return (
            item.courseId.toString() === newCartItemDto.courseId.toString()
          );
        }
        return false;
      });

      if (existingCartItem) {
        existingCartItem.isDeleted = false;
      } else {
        const newCartItem = new this.cartItemModel({
          cartId: cart._id,
          courseId: newCartItemDto.courseId,
          title: newCartItemDto.title,
          subCategory: newCartItemDto.subCategory,
          author: newCartItemDto.author,
          price: newCartItemDto.price,
          img: newCartItemDto.image,
          isDeleted: false,
        });

        cart.cartItems.push(newCartItem);
      }
    }

    await cart.save();
    cart.cartItems.filter((item) => item.isDeleted === false);
    return cart;
  }

  async removeCartItem(
    userId: Types.ObjectId,
    createCartItemDto: CreateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException(`Cart not found for user with ID ${userId}`);
    }
    const { ...payload } = createCartItemDto;
    const courseExists = cart.cartItems.find(
      (item) => item.courseId.toString() === payload.courseId.toString(),
    );
    if (!courseExists) {
      throw new NotFoundException(
        `Course with ID ${payload.courseId} not found in the user's history cart`,
      );
    } else {
      courseExists.isDeleted = true;
    }

    await cart.save();
    cart.cartItems.filter((item) => !item.isDeleted);
    return cart;
  }

  async getCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate('cartItems')
      .exec();

    if (!cart) throw new NotFoundException('Cart not found');
    cart.cartItems = cart.cartItems.filter((item) => !item.isDeleted);

    return cart;
  }

  async checkoutCart(userId: Types.ObjectId): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new NotFoundException(`Cart not found for user with ID ${userId}`);
    }
    cart.cartItems.map((item) => (item.isDeleted = true));
    await cart.save();
    cart.cartItems.filter((item) => !item.isDeleted);
    return cart;
  }
}
