import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UnitGroup } from '@prisma/client';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async listUnits() {
    return this.prisma.unit.findMany({
      orderBy: [
        { group: 'asc' },
        { isBase: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async getByCode(code: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { code },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with code '${code}' not found`);
    }

    return unit;
  }

  async convert(qty: number, fromCode: string, toCode: string): Promise<number> {
    const [fromUnit, toUnit] = await Promise.all([
      this.getByCode(fromCode),
      this.getByCode(toCode),
    ]);

    // Check if units are compatible (same group)
    if (fromUnit.group !== toUnit.group) {
      throw new BadRequestException(
        `Cannot convert between units of different groups: ${fromUnit.group} and ${toUnit.group}`,
      );
    }

    // Convert to base unit first, then to target unit
    const baseQuantity = qty * Number(fromUnit.toBaseFactor);
    const convertedQuantity = baseQuantity / Number(toUnit.toBaseFactor);

    return convertedQuantity;
  }

  async getUnitsByGroup(group: UnitGroup) {
    return this.prisma.unit.findMany({
      where: { group },
      orderBy: [
        { isBase: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async getBaseUnits() {
    return this.prisma.unit.findMany({
      where: { isBase: true },
      orderBy: { group: 'asc' },
    });
  }
}
