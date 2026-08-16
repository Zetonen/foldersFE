/** FR-UPL-07: client-side gates applied before a byte leaves the browser. */
export const UPLOAD_LIMITS = {
  /** MVP accepts PDF only. */
  acceptedMimeTypes: ['application/pdf'] as const,
  acceptedExtensions: ['.pdf'] as const,
  /** 100 MB. */
  maxFileSize: 100 * 1024 * 1024,
  maxFilesPerBatch: 20,
  minFileSize: 1,
} as const

/** FR-UPL-20: automatic retries for transport failures only. */
export const UPLOAD_RETRY = {
  maxAttempts: 2,
  baseDelayMs: 1000,
  backoffFactor: 2,
} as const

/** FR-UPL-23: the panel folds itself away once the whole batch is done. */
export const UPLOAD_PANEL_AUTO_COLLAPSE_MS = 5000

/** FR-UPL-10 / FR-MOV-11: how a name collision is resolved. */
export const CONFLICT_RESOLUTIONS = ['keepBoth', 'replace', 'skip'] as const
