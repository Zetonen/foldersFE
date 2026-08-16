import { useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { XIcon } from 'lucide-react'
import { cn } from '@/shared/helpers/cn'
import { emailSchema } from '@/types'

interface EmailChipsInputProps {
  value: string[]
  onChange: (emails: string[]) => void
  /** Edge case 17: the owner cannot invite themselves. */
  ownEmail?: string
  disabled?: boolean
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

/** Anything a user might separate addresses with when pasting a list. */
const SEPARATORS = /[\s,;]+/

/**
 * FR-SHR-02: a chip is committed on Enter, comma, Tab or blur, and a pasted
 * list is split into several at once. Invalid entries are reported rather than
 * silently dropped, so nothing the user typed disappears without explanation.
 */
export function EmailChipsInput({
  value,
  onChange,
  ownEmail,
  disabled,
  id,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: EmailChipsInputProps) {
  const [draft, setDraft] = useState('')
  const [hint, setHint] = useState<string | null>(null)

  const commit = (raw: string): void => {
    const candidates = raw.split(SEPARATORS).filter(Boolean)
    if (candidates.length === 0) return

    const accepted: string[] = []
    let message: string | null = null

    for (const candidate of candidates) {
      const parsed = emailSchema.safeParse(candidate)

      if (!parsed.success) {
        message = 'Enter a valid email address'
        continue
      }
      if (parsed.data === ownEmail) {
        message = 'You already have access'
        continue
      }
      // FR-SHR-02: repeats are collapsed, not treated as an error.
      if (value.includes(parsed.data) || accepted.includes(parsed.data))
        continue

      accepted.push(parsed.data)
    }

    setHint(message)
    if (accepted.length > 0) onChange([...value, ...accepted])
    // Only clear the field when everything in it was understood.
    setDraft(message ? raw : '')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      if (!draft.trim()) return
      event.preventDefault()
      commit(draft)
      return
    }

    // Backspace on an empty field takes back the last chip.
    if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text')
    if (!SEPARATORS.test(text)) return
    event.preventDefault()
    commit(text)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          'flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5 transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          invalid && 'border-destructive ring-destructive/20',
          disabled && 'pointer-events-none opacity-50'
        )}
      >
        {value.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1 rounded-full bg-selected py-0.5 pr-1 pl-2.5 text-xs font-medium text-brand"
          >
            {email}
            <button
              type="button"
              aria-label={`Remove ${email}`}
              onClick={() => onChange(value.filter((entry) => entry !== email))}
              className="rounded-full p-0.5 hover:bg-brand/10"
            >
              <XIcon className="size-3" strokeWidth={2} />
            </button>
          </span>
        ))}

        <input
          id={id}
          type="email"
          value={draft}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          placeholder={value.length === 0 ? 'Enter email addresses' : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            setHint(null)
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => commit(draft)}
          className="min-w-40 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {hint ? (
        <p role="alert" className="text-xs text-destructive">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
