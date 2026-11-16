import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  AddCollectionItemReqDto,
  CreateCollectionReqDto,
} from '../dto/collection-req.dto';
import {
  CollectionItemResDto,
  CollectionResDto,
} from '../dto/collection-res.dto';
import { CollectionService } from '../services/collection.service';

@ApiTags('User Collections & Bookmarks')
@Controller({ path: 'collections', version: '1' })
@UseGuards(UserAuthGuard)
export class CollectionUserController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  @ApiAuth({
    type: CollectionResDto,
    summary: 'Get current user collections',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [AllowedFilter.partial('title')],
      sorts: ['createdAt', 'updatedAt', 'itemsCount'],
      defaultSort: '-updatedAt',
    },
  })
  getMyCollections(
    @CurrentUser('id') userId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.collectionService.getMyCollections(userId, query);
  }

  @Post()
  @ApiAuth({
    type: CollectionResDto,
    summary: 'Create a new collection / board',
    statusCode: HttpStatus.CREATED,
  })
  create(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: CreateCollectionReqDto,
  ) {
    return this.collectionService.createCollection(userId, dto);
  }

  @Get(':id')
  @ApiAuth({
    type: CollectionResDto,
    summary: 'Get collection details by ID or slug',
  })
  @ApiParam({ name: 'id', type: String })
  getCollectionDetail(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') idOrSlug: string,
  ) {
    return this.collectionService.getCollectionDetail(userId, idOrSlug);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete a collection',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  async delete(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') collectionId: AutoIncrementID,
  ) {
    await this.collectionService.deleteCollection(userId, collectionId);
  }

  @Get(':id/items')
  @ApiAuth({
    type: CollectionItemResDto,
    summary: 'Get paginated items inside a collection',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['createdAt', 'sortOrder'],
      defaultSort: 'sortOrder',
    },
  })
  @ApiParam({ name: 'id', type: String })
  getItems(
    @Param('id') collectionId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.collectionService.getItems(collectionId, query);
  }

  @Post(':id/items')
  @ApiAuth({
    type: CollectionItemResDto,
    summary: 'Save a post into a collection',
    statusCode: HttpStatus.CREATED,
  })
  @ApiParam({ name: 'id', type: String })
  addItem(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') collectionId: AutoIncrementID,
    @Body() dto: AddCollectionItemReqDto,
  ) {
    return this.collectionService.addItem(userId, collectionId, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiAuth({
    summary: 'Remove an item from a collection',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'itemId', type: String })
  async removeItem(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') collectionId: AutoIncrementID,
    @Param('itemId') itemId: AutoIncrementID,
  ) {
    await this.collectionService.removeItem(userId, collectionId, itemId);
  }
}
