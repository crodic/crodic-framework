import {
  LayoutDashboard,
  HelpCircle,
  UserCog2,
  Group,
  UserLock,
  FileClock,
  ShieldCheck,
  Globe,
  MailSearch,
  PaintbrushIcon,
  Files,
  FlaskConicalIcon,
  BookOpenText,
  BookMarked,
  MapPin,
  Tags,
  CalendarDays,
  ShieldAlert,
  GalleryHorizontalEnd,
  Image as ImageIcon,
  Sliders,
  Trophy,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarLink: SidebarData = {
  navGroups: [
    {
      title: 'navigation.general.title',
      items: [
        {
          title: 'navigation.general.dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'navigation.general.activityLogs',
          url: '/logs',
          icon: FileClock,
          permission: 'LOG',
        },

        {
          title: 'navigation.general.emailLogs',
          url: '/email-logs',
          icon: MailSearch,
          permission: 'EMAIL_LOG',
        },
        {
          title: 'navigation.general.website',
          url: '/website-settings',
          icon: Globe,
        },
        {
          title: 'navigation.general.cmsPages',
          url: '/cms-pages',
          icon: BookOpenText,
          permission: 'PAGE',
        },
        {
          title: 'navigation.management.tags',
          url: '/tags',
          icon: Tags,
          permission: 'TAG',
        },
        {
          title: 'navigation.management.tagEncyclopedias',
          url: '/tag-encyclopedias',
          icon: BookMarked,
          permission: 'TAG_ENCYCLOPEDIA',
        },
      ],
    },
    {
      title: 'navigation.management.title',
      items: [
        {
          title: 'navigation.management.admins',
          url: '/admins',
          icon: UserCog2,
          permission: 'ADMIN',
        },
        {
          title: 'navigation.management.roles',
          icon: Group,
          url: '/roles',
          permission: 'ROLE',
        },
        {
          title: 'navigation.management.permissions',
          icon: ShieldCheck,
          url: '/permissions',
          permission: 'ROLE',
        },
        {
          title: 'navigation.management.users',
          url: '/users',
          icon: UserLock,
          permission: 'USER',
        },
        {
          title: 'navigation.management.whiteLabels',
          url: '/white-labels',
          icon: PaintbrushIcon,
          permission: 'WHITE_LABEL' as const,
        },
        {
          title: 'navigation.management.files',
          url: '/files',
          icon: Files,
          permission: 'FILE',
        },
        {
          title: 'navigation.management.locations',
          url: '/locations',
          icon: MapPin,
          permission: 'LOCATION',
        },
      ],
    },
    {
      title: 'navigation.kosume.title',
      items: [
        {
          title: 'navigation.kosume.reports',
          url: '/content-reports',
          icon: ShieldAlert,
          permission: 'CONTENT_REPORT',
        },
        {
          title: 'navigation.kosume.events',
          url: '/events',
          icon: CalendarDays,
          permission: 'EVENT',
        },
        {
          title: 'navigation.kosume.posts',
          url: '/posts',
          icon: ImageIcon,
          permission: 'POST',
        },
        {
          title: 'navigation.kosume.spotlight',
          url: '/spotlight-banners',
          icon: GalleryHorizontalEnd,
          permission: 'SPOTLIGHT',
        },
        {
          title: 'navigation.kosume.ranking',
          url: '/ranking-settings',
          icon: Trophy,
          permission: 'RANKING',
        },
        {
          title: 'navigation.kosume.settings',
          url: '/platform-settings',
          icon: Sliders,
          permission: 'SETTING',
        },
      ],
    },
    {
      title: 'navigation.other.title',
      items: [
        {
          title: 'navigation.other.helpCenter',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
    {
      title: 'navigation.dev.title',
      onlyDevMode: true,
      items: [
        {
          title: 'navigation.dev.playground',
          url: '/dev',
          icon: FlaskConicalIcon,
        },
      ],
    },
  ],
}
