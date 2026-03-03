export function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
