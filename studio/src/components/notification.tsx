import React, { useState, useEffect } from 'react' 
import { X, CheckCircle, XCircle, Info } from 'lucide-react' 
import { cn } from "@/lib/utils" 

export interface NotificationProps {
  type: 'success' | 'error' | 'info' 
  message: string 
  duration?: number 
  onClose?: () => void 
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  duration = 2500,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true) 

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false) 
      onClose?.() 
    }, duration) 

    return () => clearTimeout(timer) 
  }, [duration, onClose]) 

  if (!isVisible) return null 

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  } 

  const baseStyles = "fixed bottom-4 right-4 flex items-center p-4 rounded-lg shadow-lg max-w-sm" 
  const typeStyles = {
    success: "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100",
    error: "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100",
    info: "bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  } 

  return (
    <div className={cn(baseStyles, typeStyles[type])}>
      <div className="flex-shrink-0 mr-3">{icons[type]}</div>
      <div className="flex-1 mr-2">{message}</div>
      <button
        onClick={() => {
          setIsVisible(false) 
          onClose?.() 
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  ) 
} 
