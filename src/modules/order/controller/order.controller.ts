import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { ResponseMessage } from 'src/decorator/custom';
import { CreateOrderDetailDto, GetOrderDetailDto } from '../dto/create-order-detail.dto';


@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('/create')
  @ResponseMessage('Order created successfully')
  create(@Body() body: { order: CreateOrderDto, orderDetails: CreateOrderDetailDto[] }) {
    const { order, orderDetails } = body;
    return this.orderService.create(order, orderDetails);
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.orderService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get('/user/userId=:userId')
  userOrder(@Param('userId') userId: string) {
    return this.orderService.userOrder(userId);
  }

  @Get('/user/one-course')
  userOneOrder(@Query() getOrderDetailDto: GetOrderDetailDto) {
    return this.orderService.userOneOrder(getOrderDetailDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
  
  @Get('/revenue/monthly')
  async getMonthlyRevenue(@Query('year') year: string) {
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.orderService.getMonthlyRevenue(targetYear);
  }
  @Get('/revenue/weekly')
  async getWeeklyRevenue() {
    return this.orderService.getWeeklyRevenue();
  }
}
