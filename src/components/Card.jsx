export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl shadow-soft p-4 ${className}`}>
      {children}
    </div>
  )
}
