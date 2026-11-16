import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EBrandMemberRole } from '../constants/brand.constant';
import { CreateBrandReqDto, UpdateBrandReqDto } from '../dto/brand-req.dto';
import { BrandResDto } from '../dto/brand-res.dto';
import { BrandMemberEntity } from '../entities/brand-member.entity';
import { BrandEntity } from '../entities/brand.entity';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,
    @InjectRepository(BrandMemberEntity)
    private readonly memberRepo: Repository<BrandMemberEntity>,
  ) {}

  /**
   * Browse verified brands & studios with QueryBuilder.
   */
  async findAll(query: QueryParams): Promise<Paginated<BrandResDto>> {
    const baseQb = this.brandRepo.createQueryBuilder('brand');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.partial('name'),
        AllowedFilter.exact('isVerified'),
      ])
      .allowedSorts(['createdAt', 'name'])
      .defaultSort('name')
      .paginate();

    const mapped = paginated.data.map((b) => this.toBrandDto(b));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Find brand by slug.
   */
  async findBySlug(slug: string): Promise<BrandResDto> {
    const brand = await this.brandRepo.findOne({ where: { slug } });
    if (!brand) {
      throw new NotFoundException(`Brand "${slug}" not found`);
    }
    return this.toBrandDto(brand);
  }

  /**
   * Create a new brand profile.
   */
  async create(
    ownerUserId: AutoIncrementID,
    dto: CreateBrandReqDto,
  ): Promise<BrandResDto> {
    let slugCandidate = slugify(dto.name);
    if (!slugCandidate) {
      slugCandidate = `brand-${Date.now().toString(36)}`;
    }
    const collision = await this.brandRepo.count({
      where: { slug: slugCandidate },
    });
    if (collision > 0) {
      slugCandidate = `${slugCandidate}-${Date.now().toString(36).slice(-4)}`;
    }

    const brand = this.brandRepo.create({
      ownerUserId,
      name: dto.name,
      slug: slugCandidate,
      initials: dto.initials ?? null,
      color: dto.color ?? 'bg-primary',
      logoUrl: dto.logoUrl ?? null,
      coverUrl: dto.coverUrl ?? null,
      tagline: dto.tagline ?? null,
      description: dto.description ?? null,
      websiteUrl: dto.websiteUrl ?? null,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone ?? null,
      isVerified: false,
    });

    const saved = await this.brandRepo.save(brand);

    // Add owner as brand admin member
    const member = this.memberRepo.create({
      brandId: saved.id,
      userId: ownerUserId,
      role: EBrandMemberRole.OWNER,
    });
    await this.memberRepo.save(member);

    return this.toBrandDto(saved);
  }

  /**
   * Update brand profile.
   */
  async update(
    userId: AutoIncrementID,
    brandId: AutoIncrementID,
    dto: UpdateBrandReqDto,
  ): Promise<BrandResDto> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) {
      throw new NotFoundException(`Brand #${brandId} not found`);
    }

    if (String(brand.ownerUserId) !== String(userId)) {
      const isMemberAdmin = await this.memberRepo.findOne({
        where: { brandId, userId, role: EBrandMemberRole.OWNER },
      });
      if (!isMemberAdmin) {
        throw new ForbiddenException(
          'You do not have permission to manage this brand',
        );
      }
    }

    if (dto.name !== undefined) brand.name = dto.name;
    if (dto.initials !== undefined) brand.initials = dto.initials;
    if (dto.color !== undefined) brand.color = dto.color;
    if (dto.logoUrl !== undefined) brand.logoUrl = dto.logoUrl;
    if (dto.coverUrl !== undefined) brand.coverUrl = dto.coverUrl;
    if (dto.tagline !== undefined) brand.tagline = dto.tagline;
    if (dto.description !== undefined) brand.description = dto.description;
    if (dto.websiteUrl !== undefined) brand.websiteUrl = dto.websiteUrl;
    if (dto.contactEmail !== undefined) brand.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) brand.contactPhone = dto.contactPhone;

    const saved = await this.brandRepo.save(brand);
    return this.toBrandDto(saved);
  }

  private toBrandDto(b: BrandEntity): BrandResDto {
    return {
      id: b.id,
      ownerUserId: b.ownerUserId,
      name: b.name,
      slug: b.slug,
      initials: b.initials ?? null,
      color: b.color ?? null,
      logoUrl: b.logoUrl ?? null,
      coverUrl: b.coverUrl ?? null,
      tagline: b.tagline ?? null,
      description: b.description ?? null,
      websiteUrl: b.websiteUrl ?? null,
      contactEmail: b.contactEmail,
      contactPhone: b.contactPhone ?? null,
      isVerified: b.isVerified,
      createdAt: b.createdAt,
    };
  }
}
