export class AdminAnalyticsKpiDto {
  totalUsers!: number;
  totalCosplayers!: number;
  verifiedCosplayers!: number;
  totalPosts!: number;
  featuredPosts!: number;
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
