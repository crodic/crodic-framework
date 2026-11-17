export const groupPermission = [
  {
    group: 'USER',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'ADMIN',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'ROLE',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'LOG',
    permissions: ['read'],
  },

  {
    group: 'EMAIL_LOG',
    permissions: ['read'],
  },
  {
    group: 'WHITE_LABEL',
    permissions: ['create', 'read', 'update', 'delete', 'publish'],
  },
  {
    group: 'FILE',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'PAGE',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'LOCATION',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'TAG',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'TAG_ENCYCLOPEDIA',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'CONTENT_REPORT',
    permissions: ['read', 'update'],
  },
  {
    group: 'JOB',
    permissions: ['create', 'read', 'update', 'delete', 'publish'],
  },
  {
    group: 'EVENT',
    permissions: ['create', 'read', 'update', 'delete', 'publish'],
  },
  {
    group: 'SPOTLIGHT',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    group: 'manage',
    permissions: ['all'],
  },
]

export const permissions = [
  // USER
  { action: 'create', subject: 'USER' },
  { action: 'read', subject: 'USER' },
  { action: 'update', subject: 'USER' },
  { action: 'delete', subject: 'USER' },

  // ROLE
  { action: 'create', subject: 'ROLE' },
  { action: 'read', subject: 'ROLE' },
  { action: 'update', subject: 'ROLE' },
  { action: 'delete', subject: 'ROLE' },

  // ADMIN
  { action: 'create', subject: 'ADMIN' },
  { action: 'read', subject: 'ADMIN' },
  { action: 'update', subject: 'ADMIN' },
  { action: 'delete', subject: 'ADMIN' },

  // LOG
  { action: 'read', subject: 'LOG' },

  // EMAIL_LOG
  { action: 'read', subject: 'EMAIL_LOG' },

  // WHITE_LABEL
  { action: 'create', subject: 'WHITE_LABEL' },
  { action: 'read', subject: 'WHITE_LABEL' },
  { action: 'update', subject: 'WHITE_LABEL' },
  { action: 'delete', subject: 'WHITE_LABEL' },
  { action: 'publish', subject: 'WHITE_LABEL' },

  // FILE
  { action: 'create', subject: 'FILE' },
  { action: 'read', subject: 'FILE' },
  { action: 'update', subject: 'FILE' },
  { action: 'delete', subject: 'FILE' },

  // PAGE
  { action: 'create', subject: 'PAGE' },
  { action: 'read', subject: 'PAGE' },
  { action: 'update', subject: 'PAGE' },
  { action: 'delete', subject: 'PAGE' },

  // LOCATION
  { action: 'create', subject: 'LOCATION' },
  { action: 'read', subject: 'LOCATION' },
  { action: 'update', subject: 'LOCATION' },
  { action: 'delete', subject: 'LOCATION' },

  // TAG
  { action: 'create', subject: 'TAG' },
  { action: 'read', subject: 'TAG' },
  { action: 'update', subject: 'TAG' },
  { action: 'delete', subject: 'TAG' },

  // TAG_ENCYCLOPEDIA
  { action: 'create', subject: 'TAG_ENCYCLOPEDIA' },
  { action: 'read', subject: 'TAG_ENCYCLOPEDIA' },
  { action: 'update', subject: 'TAG_ENCYCLOPEDIA' },
  { action: 'delete', subject: 'TAG_ENCYCLOPEDIA' },

  // CONTENT_REPORT
  { action: 'read', subject: 'CONTENT_REPORT' },
  { action: 'update', subject: 'CONTENT_REPORT' },

  // JOB
  { action: 'create', subject: 'JOB' },
  { action: 'read', subject: 'JOB' },
  { action: 'update', subject: 'JOB' },
  { action: 'delete', subject: 'JOB' },
  { action: 'publish', subject: 'JOB' },

  // EVENT
  { action: 'create', subject: 'EVENT' },
  { action: 'read', subject: 'EVENT' },
  { action: 'update', subject: 'EVENT' },
  { action: 'delete', subject: 'EVENT' },
  { action: 'publish', subject: 'EVENT' },

  // SPOTLIGHT
  { action: 'create', subject: 'SPOTLIGHT' },
  { action: 'read', subject: 'SPOTLIGHT' },
  { action: 'update', subject: 'SPOTLIGHT' },
  { action: 'delete', subject: 'SPOTLIGHT' },

  // SUPER
  { action: 'manage', subject: 'all' },
] as const

type Permission = (typeof permissions)[number]

export type Actions = Permission['action']
export type Subjects = Permission['subject']
