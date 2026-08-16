/** FR-ROOMS-05: the dialog says different things when creating and renaming. */
export const ROOM_NAME_COPY = {
  create: {
    title: 'New data room',
    description: 'A data room is a workspace for one set of documents.',
    submit: 'Create',
  },
  rename: {
    title: 'Rename data room',
    description: 'Everyone with access will see the new name.',
    submit: 'Save',
  },
} as const

export const ROOM_NAME_PLACEHOLDER = 'Acme Acquisition'
