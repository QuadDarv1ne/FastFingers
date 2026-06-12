export function simulateInput(input: HTMLInputElement): React.FormEvent<HTMLInputElement> {
  const event = new Event('input', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'currentTarget', { value: input, writable: false })
  Object.defineProperty(event, 'target', { value: input, writable: false })
  return event as unknown as React.FormEvent<HTMLInputElement>
}
