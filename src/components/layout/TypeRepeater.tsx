export function TypeRepeater() {
  return (
    <div className="type-repeater" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((row) => (
        <div className="type-row" key={row}>
          {[0, 1, 2, 3].map((item) => <span key={item}>CONNECT FAESA</span>)}
        </div>
      ))}
    </div>
  )
}
