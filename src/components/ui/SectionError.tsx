export function SectionError({ message }: { message: string }) {
  return (
    <div className="glass rounded-xl p-6 text-center" role="alert">
      <p className="text-sm text-dark-400">{message}</p>
    </div>
  )
}
