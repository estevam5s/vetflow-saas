import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        ...dto,
        clinicId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async findAll(clinicId: string, filters: { type?: TransactionType; startDate?: string; endDate?: string }) {
    const { type, startDate, endDate } = filters;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        date: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      };
    }

    return this.prisma.transaction.findMany({
      where: { clinicId, ...(type && { type }), ...dateFilter },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, clinicId },
    });
    if (!transaction) throw new NotFoundException('Transação não encontrada.');
    return transaction;
  }

  async summary(clinicId: string, startDate?: string, endDate?: string) {
    const where: any = { clinicId };
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    const [incomes, expenses] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.INCOME },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = incomes._sum.amount || 0;
    const totalExpense = expenses._sum.amount || 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeCount: incomes._count,
      expenseCount: expenses._count,
    };
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Transação removida com sucesso.' };
  }
}
