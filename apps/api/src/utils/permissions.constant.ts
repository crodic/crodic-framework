export enum AppSubjects {
  User = 'USER',
  Role = 'ROLE',
  Log = 'LOG',
  Admin = 'ADMIN',
  EmailLog = 'EMAIL_LOG',
  WhiteLabel = 'WHITE_LABEL',
  File = 'FILE',
  Page = 'PAGE',
  Location = 'LOCATION',
  Setting = 'SETTING',
  Tag = 'TAG',
  TagEncyclopedia = 'TAG_ENCYCLOPEDIA',

  // Kosume Domain Subjects
  Cosplayer = 'COSPLAYER',
  Post = 'POST',
  Brand = 'BRAND',
  Job = 'JOB',
  Event = 'EVENT',
  Booking = 'BOOKING',
  Spotlight = 'SPOTLIGHT',
  ContentReport = 'CONTENT_REPORT',
  Ranking = 'RANKING',
  CronJob = 'CRON_JOB',

  All = 'all',
}

export enum AppActions {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Publish = 'publish',

  // ⚡ SUPER
  Manage = 'manage',
}

const permissionMeta = (
  action: AppActions,
  subject: AppSubjects,
  group: string,
  name: string,
  description: string,
) => ({
  key: `${action}:${subject}`,
  group,
  name,
  description,
});

export const ALL_PERMISSIONS = [
  // Admin
  permissionMeta(
    AppActions.Read,
    AppSubjects.Admin,
    'Admin Management',
    'View admins',
    'View administrator accounts and their assigned roles.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Admin,
    'Admin Management',
    'Create admins',
    'Invite or create administrator accounts.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Admin,
    'Admin Management',
    'Update admins',
    'Edit administrator profile details, status, and role assignments.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Admin,
    'Admin Management',
    'Delete admins',
    'Remove administrator accounts from the system.',
  ),

  // User
  permissionMeta(
    AppActions.Read,
    AppSubjects.User,
    'User Management',
    'View users',
    'View customer or member user accounts.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.User,
    'User Management',
    'Create users',
    'Create customer or member user accounts.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.User,
    'User Management',
    'Update users',
    'Edit customer or member user account details.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.User,
    'User Management',
    'Delete users',
    'Remove customer or member user accounts.',
  ),

  // Role
  permissionMeta(
    AppActions.Read,
    AppSubjects.Role,
    'Role Management',
    'View roles',
    'View roles and their permission assignments.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Role,
    'Role Management',
    'Create roles',
    'Create roles and assign allowed permissions.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Role,
    'Role Management',
    'Update roles',
    'Edit role details and permission assignments.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Role,
    'Role Management',
    'Delete roles',
    'Remove roles that are no longer used.',
  ),

  // Log
  permissionMeta(
    AppActions.Read,
    AppSubjects.Log,
    'Audit & Activity',
    'View activity logs',
    'Review audit trails and activity history.',
  ),

  // Email
  permissionMeta(
    AppActions.Read,
    AppSubjects.EmailLog,
    'Email',
    'View email logs',
    'Review all email delivery logs and failures.',
  ),

  // White Label
  permissionMeta(
    AppActions.Read,
    AppSubjects.WhiteLabel,
    'White Label Management',
    'View white labels',
    'View portal and client white label profiles.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.WhiteLabel,
    'White Label Management',
    'Create white labels',
    'Create new white label profiles with custom branding and styles.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.WhiteLabel,
    'White Label Management',
    'Update white labels',
    'Edit white label branding, assets, and design tokens.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.WhiteLabel,
    'White Label Management',
    'Delete white labels',
    'Remove white label profiles that are no longer used.',
  ),
  permissionMeta(
    AppActions.Publish,
    AppSubjects.WhiteLabel,
    'White Label Management',
    'Activate white labels',
    'Activate a white label profile for the admin portal or client app.',
  ),

  // File
  permissionMeta(
    AppActions.Read,
    AppSubjects.File,
    'File Management',
    'View files',
    'View uploaded files and folder metadata.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.File,
    'File Management',
    'Upload files',
    'Upload files and create logical folders.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.File,
    'File Management',
    'Update files',
    'Move files between folders and update file metadata.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.File,
    'File Management',
    'Delete files',
    'Delete uploaded files and empty logical folders.',
  ),

  // Page
  permissionMeta(
    AppActions.Read,
    AppSubjects.Page,
    'CMS Pages Management',
    'View pages',
    'View CMS pages.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Page,
    'CMS Pages Management',
    'Create pages',
    'Create new CMS pages.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Page,
    'CMS Pages Management',
    'Update pages',
    'Edit CMS pages.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Page,
    'CMS Pages Management',
    'Delete pages',
    'Delete CMS pages.',
  ),

  // Location
  permissionMeta(
    AppActions.Read,
    AppSubjects.Location,
    'Location Management',
    'View locations',
    'View regions, countries, states, and cities.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Location,
    'Location Management',
    'Create locations',
    'Create regions, countries, states, and cities.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Location,
    'Location Management',
    'Update locations',
    'Edit regions, countries, states, and cities.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Location,
    'Location Management',
    'Delete locations',
    'Remove regions, countries, states, and cities.',
  ),

  // Setting
  permissionMeta(
    AppActions.Read,
    AppSubjects.Setting,
    'Settings Management',
    'View settings',
    'View website and system settings.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Setting,
    'Settings Management',
    'Update settings',
    'Update website and system settings.',
  ),

  // Tag
  permissionMeta(
    AppActions.Read,
    AppSubjects.Tag,
    'Tag Management',
    'View tags',
    'View tags, translations, aliases, hierarchy, and tag audit logs.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Tag,
    'Tag Management',
    'Create tags',
    'Create canonical tags, translations, aliases, and hierarchy edges.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Tag,
    'Tag Management',
    'Update tags',
    'Edit tags, manage hierarchy, merge tags, and moderate tag statuses.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Tag,
    'Tag Management',
    'Delete tags',
    'Delete or ban tags and remove tag aliases or hierarchy links.',
  ),

  // Tag Encyclopedia
  permissionMeta(
    AppActions.Read,
    AppSubjects.TagEncyclopedia,
    'Tag Encyclopedia Management',
    'View tag encyclopedias',
    'View tag wiki encyclopedia articles and revision histories.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.TagEncyclopedia,
    'Tag Encyclopedia Management',
    'Create tag encyclopedias',
    'Create new localized tag wiki encyclopedia articles.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.TagEncyclopedia,
    'Tag Encyclopedia Management',
    'Update tag encyclopedias',
    'Edit tag wiki articles, toggle edit locks, and rollback revisions.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.TagEncyclopedia,
    'Tag Encyclopedia Management',
    'Delete tag encyclopedias',
    'Delete tag wiki encyclopedia articles.',
  ),

  // Cosplayer
  permissionMeta(
    AppActions.Read,
    AppSubjects.Cosplayer,
    'Cosplayer Management',
    'View cosplayer profiles',
    'View cosplayer profiles, rate cards, and portrayed characters.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Cosplayer,
    'Cosplayer Management',
    'Update cosplayer profiles',
    'Edit cosplayer profile information and toggle verified status.',
  ),
  permissionMeta(
    AppActions.Publish,
    AppSubjects.Cosplayer,
    'Cosplayer Management',
    'Verify cosplayers',
    'Grant or revoke official verified cosplayer badge.',
  ),

  // Post / Album
  permissionMeta(
    AppActions.Read,
    AppSubjects.Post,
    'Post & Album Management',
    'View posts and albums',
    'View artworks, albums, photosets, and comments.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Post,
    'Post & Album Management',
    'Update posts',
    'Edit post visibility, status, and featured flag.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Post,
    'Post & Album Management',
    'Delete posts',
    'Remove infringing or inappropriate posts and comments.',
  ),
  permissionMeta(
    AppActions.Publish,
    AppSubjects.Post,
    'Post & Album Management',
    'Feature posts',
    'Feature artworks on homepage and explore podiums.',
  ),

  // Brand
  permissionMeta(
    AppActions.Read,
    AppSubjects.Brand,
    'Brand Management',
    'View brands',
    'View recruiter brands and studios.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Brand,
    'Brand Management',
    'Create brands',
    'Register corporate brands and verified studios.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Brand,
    'Brand Management',
    'Update brands',
    'Edit brand information and toggle verified studio badge.',
  ),
  permissionMeta(
    AppActions.Publish,
    AppSubjects.Brand,
    'Brand Management',
    'Verify brands',
    'Grant or revoke official verified brand badge.',
  ),

  // Job
  permissionMeta(
    AppActions.Read,
    AppSubjects.Job,
    'Job Management',
    'View jobs',
    'View recruitment listings and applicant submissions.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Job,
    'Job Management',
    'Create jobs',
    'Post recruitment listings on behalf of clients or brands.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Job,
    'Job Management',
    'Update jobs',
    'Edit job details, review status, and featured placement.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Job,
    'Job Management',
    'Delete jobs',
    'Remove expired or prohibited job listings.',
  ),
  permissionMeta(
    AppActions.Publish,
    AppSubjects.Job,
    'Job Management',
    'Approve jobs',
    'Approve pending job listings to open status.',
  ),

  // Event
  permissionMeta(
    AppActions.Read,
    AppSubjects.Event,
    'Event Management',
    'View events',
    'View cosplay festivals, schedules, and guest applications.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Event,
    'Event Management',
    'Create events',
    'Publish new cosplay events, conventions, and festivals.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Event,
    'Event Management',
    'Update events',
    'Edit event information, hero banners, and schedules.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Event,
    'Event Management',
    'Delete events',
    'Remove or cancel cosplay events.',
  ),
  permissionMeta(
    AppActions.Publish,
    AppSubjects.Event,
    'Event Management',
    'Feature events',
    'Feature events in top carousel banner.',
  ),

  // Booking
  permissionMeta(
    AppActions.Read,
    AppSubjects.Booking,
    'Booking Management',
    'View booking requests',
    'Monitor direct booking inquiries and platform dispute logs.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Booking,
    'Booking Management',
    'Moderate bookings',
    'Manage or intervene in booking status and disputes.',
  ),

  // Spotlight
  permissionMeta(
    AppActions.Read,
    AppSubjects.Spotlight,
    'Spotlight Management',
    'View spotlights',
    'View spotlight slides and homepage featured creator cards.',
  ),
  permissionMeta(
    AppActions.Create,
    AppSubjects.Spotlight,
    'Spotlight Management',
    'Create spotlights',
    'Create spotlight hero banner slides.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Spotlight,
    'Spotlight Management',
    'Update spotlights',
    'Edit spotlight ordering and activation toggles.',
  ),
  permissionMeta(
    AppActions.Delete,
    AppSubjects.Spotlight,
    'Spotlight Management',
    'Delete spotlights',
    'Remove spotlight slides.',
  ),

  // Content Report
  permissionMeta(
    AppActions.Read,
    AppSubjects.ContentReport,
    'Content Moderation',
    'View reports',
    'View community reports against posts, users, or comments.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.ContentReport,
    'Content Moderation',
    'Resolve reports',
    'Review, resolve, or dismiss moderation reports.',
  ),

  // Ranking
  permissionMeta(
    AppActions.Read,
    AppSubjects.Ranking,
    'Ranking Management',
    'View rankings',
    'View leaderboard score snapshots and recalculation history.',
  ),
  permissionMeta(
    AppActions.Update,
    AppSubjects.Ranking,
    'Ranking Management',
    'Manage rankings',
    'Trigger leaderboard recalculation and adjust ranking weights.',
  ),

  // Cron Job
  permissionMeta(
    AppActions.Read,
    AppSubjects.CronJob,
    'Cron Job Management',
    'View cron jobs',
    'View scheduled cron jobs and execution log history.',
  ),
  permissionMeta(
    AppActions.Manage,
    AppSubjects.CronJob,
    'Cron Job Management',
    'Trigger cron jobs',
    'Manually trigger immediate execution of scheduled cron tasks.',
  ),

  // SUPER
  permissionMeta(
    AppActions.Manage,
    AppSubjects.All,
    'System',
    'Full system access',
    'Reserved system permission with unrestricted access. Not assignable in role forms.',
  ),
];

export const ADMIN_FULL_ACCESS = {
  action: AppActions.Manage,
  subject: AppSubjects.All,
};
