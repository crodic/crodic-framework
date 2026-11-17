export class AdminAnalyticsKpiDto {
  totalUsers!: number;
  totalCosplayers!: number;
  verifiedCosplayers!: number;
  totalPosts!: number;
  featuredPosts!: number;
  totalBookings!: number;
  completedBookings!: number;
  activeEvents!: number;
  openJobs!: number;
  pendingReports!: number;
  pendingPosts!: number;
  pendingBookings!: number;
}

export class CategoryDistributionItemDto {
  category!: string;
  count!: number;
}

export class BookingStatusDistributionItemDto {
  status!: string;
  count!: number;
}

export class AdminAnalyticsOverviewResDto {
  kpi!: AdminAnalyticsKpiDto;
  postCategories!: CategoryDistributionItemDto[];
  bookingStatuses!: BookingStatusDistributionItemDto[];
}
