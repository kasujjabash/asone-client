/** Today as `YYYY-MM-DD`, which is the date format the API speaks. */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
