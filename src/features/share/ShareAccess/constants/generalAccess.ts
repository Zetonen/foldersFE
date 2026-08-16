/** FR-SHR-07: the two values of the "General access" select. */
export const GENERAL_ACCESS = {
  restricted: 'restricted',
  anyone: 'anyone',
} as const

export const GENERAL_ACCESS_HINT = {
  restricted: 'Only people with access can open this link.',
  anyone: 'Anyone signed in who has the link can view.',
} as const

/** FR-SHR-09: the warning shown before a link is taken away. */
export const REVOKE_LINK_COPY = {
  title: 'Turn off link sharing?',
  description: 'Anyone who already has this link will lose access immediately.',
  confirm: 'Turn off',
} as const
