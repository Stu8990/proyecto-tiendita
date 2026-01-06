/**
 * Componente Card reutilizable
 * Contenedor con shadow, rounded y padding
 */
export const Card = ({
  children,
  title,
  subtitle,
  className = '',
  padding = 'normal',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    normal: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md ${paddings[padding]} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
