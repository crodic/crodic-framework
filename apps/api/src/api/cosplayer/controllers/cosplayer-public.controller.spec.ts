import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { CosplayerPublicController } from './cosplayer-public.controller';
import { CosplayerService } from '../services/cosplayer.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('CosplayerPublicController', () => {
  let controller: CosplayerPublicController;
  let service: Partial<Record<keyof CosplayerService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findBySlugOrHandle: jest.fn().mockResolvedValue({
        id: id('1'),
        slug: 'kiriko-cos',
        displayName: 'KIRIKO',
        characters: [{ id: id('20'), characterName: 'Raiden Shogun' }],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CosplayerPublicController],
      providers: [{ provide: CosplayerService, useValue: service }],
    }).compile();

    controller = module.get<CosplayerPublicController>(
      CosplayerPublicController,
    );
  });

  it('findAll delegates to service', async () => {
    await controller.findAll({});
    expect(service.findAll).toHaveBeenCalledWith({});
  });

  it('findBySlug delegates to service', async () => {
    const res = await controller.findBySlug('kiriko-cos');
    expect(res.slug).toBe('kiriko-cos');
    expect(service.findBySlugOrHandle).toHaveBeenCalledWith('kiriko-cos');
  });

  it('getCharacters returns characters', async () => {
    const res = await controller.getCharacters('kiriko-cos');
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(id('20'));
  });
});
