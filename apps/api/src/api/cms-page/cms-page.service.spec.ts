import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AutoIncrementID } from '../../common/types/common.type';
import { CmsPageTranslationEntity } from './entities/cms-page-translation.entity';
import { CmsPageEntity, ECmsPageStatus } from './entities/cms-page.entity';
import { CmsPageService } from './cms-page.service';

describe('CmsPageService', () => {
  let service: CmsPageService;

  const mockTransactionManager = {
    create: jest.fn((entity, data) => ({ ...data })),
    save: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockCmsPageRepo = {
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest
      .fn()
      .mockImplementation((data) =>
        Promise.resolve({ id: '1' as AutoIncrementID, ...data }),
      ),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    manager: {
      transaction: jest
        .fn()
        .mockImplementation((cb) => cb(mockTransactionManager)),
    },
  };

  const mockTranslationRepo = {
    find: jest.fn().mockResolvedValue([]),
    exists: jest.fn().mockResolvedValue(false),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsPageService,
        {
          provide: getRepositoryToken(CmsPageEntity),
          useValue: mockCmsPageRepo,
        },
        {
          provide: getRepositoryToken(CmsPageTranslationEntity),
          useValue: mockTranslationRepo,
        },
      ],
    }).compile();

    service = module.get<CmsPageService>(CmsPageService);
  });

  describe('update', () => {
    it('should throw NotFoundException if page does not exist', async () => {
      mockCmsPageRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          '999' as AutoIncrementID,
          { status: ECmsPageStatus.PUBLISHED },
          '1' as AutoIncrementID,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update existing translation in-place without deleting it', async () => {
      const existingTranslation = {
        id: '10' as AutoIncrementID,
        pageId: '1' as AutoIncrementID,
        locale: 'en',
        slug: 'about-us',
        title: 'Old Title',
        content: 'Old Content',
        createdAt: new Date('2026-01-01'),
      } as unknown as CmsPageTranslationEntity;

      const existingPage = {
        id: '1' as AutoIncrementID,
        status: ECmsPageStatus.DRAFT,
        translations: [existingTranslation],
      } as unknown as CmsPageEntity;

      mockCmsPageRepo.findOne
        .mockResolvedValueOnce(existingPage)
        .mockResolvedValueOnce({
          ...existingPage,
          translations: [
            {
              ...existingTranslation,
              title: 'Updated Title',
              content: 'Updated Content',
            },
          ],
        });

      await service.update(
        '1' as AutoIncrementID,
        {
          translations: [
            {
              locale: 'en',
              title: 'Updated Title',
              content: 'Updated Content',
              slug: 'about-us',
            },
          ],
        },
        '1' as AutoIncrementID,
      );

      // Verify that delete was NOT called because 'en' translation was updated in-place
      expect(mockTransactionManager.delete).not.toHaveBeenCalled();

      // Verify save was called with the existing translation (preserving id: 10)
      expect(mockTransactionManager.save).toHaveBeenCalledWith(
        CmsPageTranslationEntity,
        expect.arrayContaining([
          expect.objectContaining({
            id: '10',
            title: 'Updated Title',
            content: 'Updated Content',
            slug: 'about-us',
          }),
        ]),
      );
    });

    it('should delete only removed translation and insert newly added translation', async () => {
      const existingEn = {
        id: '10' as AutoIncrementID,
        pageId: '1' as AutoIncrementID,
        locale: 'en',
        slug: 'about-us',
        title: 'About Us',
        content: 'Content',
      } as unknown as CmsPageTranslationEntity;

      const existingVi = {
        id: '20' as AutoIncrementID,
        pageId: '1' as AutoIncrementID,
        locale: 'vi',
        slug: 've-chung-toi',
        title: 'Về chúng tôi',
        content: 'Nội dung',
      } as unknown as CmsPageTranslationEntity;

      const existingPage = {
        id: '1' as AutoIncrementID,
        status: ECmsPageStatus.PUBLISHED,
        translations: [existingEn, existingVi],
      } as unknown as CmsPageEntity;

      mockCmsPageRepo.findOne
        .mockResolvedValueOnce(existingPage)
        .mockResolvedValueOnce(existingPage);

      // Update replaces 'vi' with 'fr', while keeping 'en'
      await service.update(
        '1' as AutoIncrementID,
        {
          translations: [
            {
              locale: 'en',
              title: 'About Us Updated',
              content: 'Content Updated',
              slug: 'about-us',
            },
            {
              locale: 'fr',
              title: 'A Propos',
              content: 'Contenu',
              slug: 'a-propos',
            },
          ],
        },
        '1' as AutoIncrementID,
      );

      // 'vi' (id: 20) should be deleted
      expect(mockTransactionManager.delete).toHaveBeenCalledWith(
        CmsPageTranslationEntity,
        expect.objectContaining({
          id: expect.anything(),
        }),
      );

      // 'en' (id: 10) updated + 'fr' newly created
      expect(mockTransactionManager.save).toHaveBeenCalledWith(
        CmsPageTranslationEntity,
        expect.arrayContaining([
          expect.objectContaining({
            id: '10',
            title: 'About Us Updated',
          }),
          expect.objectContaining({
            locale: 'fr',
            title: 'A Propos',
          }),
        ]),
      );
    });
  });
});
