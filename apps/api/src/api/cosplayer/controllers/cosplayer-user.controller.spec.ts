import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { CosplayerUserController } from './cosplayer-user.controller';
import { CosplayerService } from '../services/cosplayer.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('CosplayerUserController', () => {
  let controller: CosplayerUserController;
  let service: Partial<Record<keyof CosplayerService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      getMyProfile: jest
        .fn()
        .mockResolvedValue({ id: id('1'), displayName: 'KIRIKO' }),
      updateProfile: jest
        .fn()
        .mockResolvedValue({ id: id('1'), displayName: 'Updated' }),
      getCharactersByUserId: jest.fn().mockResolvedValue([]),
      addCharacter: jest.fn().mockResolvedValue({ id: id('20') }),
      updateCharacter: jest.fn().mockResolvedValue({ id: id('20') }),
      deleteCharacter: jest.fn().mockResolvedValue(undefined),
      uploadMedia: jest.fn().mockResolvedValue({ url: 'http://media.jpg' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CosplayerUserController],
      providers: [{ provide: CosplayerService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CosplayerUserController>(CosplayerUserController);
  });

  it('getMyProfile delegates to service with userId', async () => {
    const res = await controller.getMyProfile(id('100'));
    expect(res.displayName).toBe('KIRIKO');
    expect(service.getMyProfile).toHaveBeenCalledWith(id('100'));
  });

  it('updateProfile delegates to service', async () => {
    await controller.updateProfile(id('100'), { displayName: 'Updated' });
    expect(service.updateProfile).toHaveBeenCalledWith(id('100'), {
      displayName: 'Updated',
    });
  });

  it('characters endpoints delegate correctly', async () => {
    await controller.getMyCharacters(id('100'));
    expect(service.getCharactersByUserId).toHaveBeenCalledWith(id('100'));

    await controller.addCharacter(id('100'), {
      characterName: 'Acheron',
      seriesName: 'HSR',
      coverImageUrl: 'url',
    });
    expect(service.addCharacter).toHaveBeenCalledWith(id('100'), {
      characterName: 'Acheron',
      seriesName: 'HSR',
      coverImageUrl: 'url',
    });

    await controller.deleteCharacter(id('100'), id('20'));
    expect(service.deleteCharacter).toHaveBeenCalledWith(id('100'), id('20'));
  });

  it('uploadMedia delegates to service with parsed watermark flag', async () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      size: 100,
      originalname: 'photo.jpg',
    } as Express.Multer.File;

    await controller.uploadMedia(
      id('100'),
      { file: [mockFile] },
      'posts',
      'true',
    );
    expect(service.uploadMedia).toHaveBeenCalledWith(
      id('100'),
      mockFile,
      'posts',
      true,
    );
  });
});
