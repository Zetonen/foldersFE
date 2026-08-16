/**
 * The backend has no `fieldErrors` object. A failed DTO validation arrives as
 * a 400 carrying an array of `class-validator` strings, each of which starts
 * with the property it is about:
 *
 *   ["email must be an email", "password must be longer than or equal to 8"]
 *
 * So the field name is recovered from the first word. Anything that does not
 * look like a property name is left alone — it is a plain sentence, and
 * guessing a field out of it would put the error under the wrong input.
 */
const PROPERTY_NAME = /^[a-z][A-Za-z0-9_]*$/

export function parseFieldErrors(
  messages: readonly string[]
): Record<string, string> | undefined {
  const fieldErrors: Record<string, string> = {}

  for (const message of messages) {
    const [field] = message.split(' ')

    if (!field || !PROPERTY_NAME.test(field)) continue
    // The first complaint about a field is the one shown under it.
    if (field in fieldErrors) continue

    fieldErrors[field] = message
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
}
