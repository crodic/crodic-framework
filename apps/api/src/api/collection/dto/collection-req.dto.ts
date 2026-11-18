import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BooleanFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';

export class CreateCollectionReqDto {
  @StringField({ maxLength: 140 })
  @Trim()
  title!: string;

  @StringFieldOptional({ maxLength: 500 })
  @Trim()
  description?: string;

  @BooleanFieldOptional()
  isPublic?: boolean;
}

export class AddCollectionItemReqDto {
  @StringField()
  postId!: AutoIncrementID;

  @StringFieldOptional()
  postMediaId?: AutoIncrementID;
}
