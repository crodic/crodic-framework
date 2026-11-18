export class AdminAnalyticsKpiDto {
  totalUsers!: number;
  verifiedUsers!: number;
  totalCosplayers!: number;
  verifiedCosplayers!: number;
  totalPosts!: number;
  featuredPosts!: number;
  totalEvents!: number;
  activeEvents!: number;
  pendingReports!: number;
  pendingPosts!: number;
}

export class CategoryDistributionItemDto {
  category!: string;
  count!: number;
}

export class AdminAnalyticsOverviewResDto {
  kpi!: AdminAnalyticsKpiDto;
  postCategories!: CategoryDistributionItemDto[];
}
