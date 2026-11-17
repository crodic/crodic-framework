import { AutoIncrementID } from '../../../common/types/common.type';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { EBookingRequestStatus } from '../constants/booking.constant';
import { BookingAdminController } from './booking-admin.controller';
import { BookingService } from '../services/booking.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('BookingAdminController', () => {
  let controller: BookingAdminController;
  let service: Partial<Record<keyof BookingService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAllAdmin: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOneAdmin: jest
        .fn()
        .mockResolvedValue({ id: id('1'), bookingType: 'Photoshoot' }),
      updateStatusAdmin: jest
        .fn()
        .mockResolvedValue({
          id: id('1'),
          status: EBookingRequestStatus.COMPLETED,
        }),
      deleteAdmin: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingAdminController],
      providers: [{ provide: BookingService, useValue: service }],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookingAdminController>(BookingAdminController);
  });

  it('findAll delegates to service.findAllAdmin', async () => {
    const query: any = {};
    await controller.findAll(query);
    expect(service.findAllAdmin).toHaveBeenCalledWith(query);
  });

  it('findOne delegates to service.findOneAdmin', async () => {
    await controller.findOne(id('1'));
    expect(service.findOneAdmin).toHaveBeenCalledWith(id('1'));
  });

  it('updateStatus delegates to service.updateStatusAdmin', async () => {
    const dto = {
      status: EBookingRequestStatus.COMPLETED,
      responseNote: 'Dispute resolved by admin',
    };
    await controller.updateStatus(id('1'), dto);
    expect(service.updateStatusAdmin).toHaveBeenCalledWith(id('1'), dto);
  });

  it('delete delegates to service.deleteAdmin', async () => {
    await controller.delete(id('1'));
    expect(service.deleteAdmin).toHaveBeenCalledWith(id('1'));
  });
});
