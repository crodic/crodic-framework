import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { EBookingRequestStatus } from '../constants/booking.constant';
import { BookingUserController } from './booking-user.controller';
import { BookingService } from '../services/booking.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('BookingUserController', () => {
  let controller: BookingUserController;
  let service: Partial<Record<keyof BookingService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      createBookingRequest: jest
        .fn()
        .mockResolvedValue({
          id: id('1'),
          status: EBookingRequestStatus.PENDING,
        }),
      getMySentBookings: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      getMyReceivedBookings: jest
        .fn()
        .mockResolvedValue({ data: [], meta: {} }),
      updateBookingStatus: jest
        .fn()
        .mockResolvedValue({
          id: id('1'),
          status: EBookingRequestStatus.ACCEPTED,
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingUserController],
      providers: [{ provide: BookingService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookingUserController>(BookingUserController);
  });

  it('create delegates to service', async () => {
    const dto: any = { targetCosplayerId: id('200') };
    const res = await controller.create(id('100'), dto);
    expect(res.id).toBe(id('1'));
    expect(service.createBookingRequest).toHaveBeenCalledWith(id('100'), dto);
  });

  it('getMySentBookings delegates to service', async () => {
    const query: any = {};
    await controller.getMySentBookings(id('100'), query);
    expect(service.getMySentBookings).toHaveBeenCalledWith(id('100'), query);
  });

  it('getMyReceivedBookings delegates to service', async () => {
    const query: any = {};
    await controller.getMyReceivedBookings(id('100'), query);
    expect(service.getMyReceivedBookings).toHaveBeenCalledWith(
      id('100'),
      query,
    );
  });

  it('updateStatus delegates to service', async () => {
    const dto: any = { status: EBookingRequestStatus.ACCEPTED };
    const res = await controller.updateStatus(id('100'), id('1'), dto);
    expect(res.status).toBe(EBookingRequestStatus.ACCEPTED);
    expect(service.updateBookingStatus).toHaveBeenCalledWith(
      id('100'),
      id('1'),
      dto,
    );
  });
});
