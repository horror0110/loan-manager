import React, { useEffect, useRef } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Modal Component
export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md", // sm, md, lg, xl, full
  closable = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  showCloseButton = true,
  preventScroll = true,
}) => {
  const modalRef = useRef(null);

  // Size variants
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (preventScroll && isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, preventScroll]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && closable) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closable, closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && closable && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener("keydown", handleTabKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative bg-white rounded-lg shadow-xl w-full transform transition-all",
          "max-h-[90vh] overflow-hidden flex flex-col",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && closable && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// Dialog Component with predefined styles
export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  type = "default", // default, success, warning, error, info
  size = "md",
  ...modalProps
}) => {
  const typeIcons = {
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />,
  };

  const typeColors = {
    success: "text-green-900",
    warning: "text-yellow-900",
    error: "text-red-900",
    info: "text-blue-900",
    default: "text-gray-900",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} {...modalProps}>
      <div className="p-6">
        {/* Header with Icon */}
        <div className="flex items-start space-x-3 mb-4">
          {type !== "default" && typeIcons[type]}
          <div className="flex-1">
            {title && (
              <h3 className={cn("text-lg font-semibold", typeColors[type])}>
                {title}
              </h3>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-gray-600">{children}</div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-2">
          {footer}
        </div>
      )}
    </Modal>
  );
};

// Confirm Dialog
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Баталгаажуулах",
  message = "Энэ үйлдлийг хийхийг хүсэж байна уу?",
  confirmText = "Тийм",
  cancelText = "Үгүй",
  type = "warning",
  loading = false,
  ...dialogProps
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    if (!loading) {
      onClose();
    }
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className={cn(
          "px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
          type === "error"
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            : type === "warning"
            ? "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        )}
      >
        {loading ? "Түр хүлээнэ үү..." : confirmText}
      </button>
    </>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      footer={footer}
      size="sm"
      {...dialogProps}
    >
      <p>{message}</p>
    </Dialog>
  );
};

// Alert Dialog
export const AlertDialog = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Ойлголоо",
  type = "info",
  ...dialogProps
}) => {
  const footer = (
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {buttonText}
    </button>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      footer={footer}
      size="sm"
      {...dialogProps}
    >
      <p>{message}</p>
    </Dialog>
  );
};

// Drawer Component (slide from side)
export const Drawer = ({
  isOpen,
  onClose,
  children,
  title,
  position = "right", // left, right, top, bottom
  size = "md", // sm, md, lg
  closable = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  className,
  showCloseButton = true,
}) => {
  // Position classes
  const positionClasses = {
    right: "right-0 top-0 h-full",
    left: "left-0 top-0 h-full",
    top: "top-0 left-0 w-full",
    bottom: "bottom-0 left-0 w-full",
  };

  // Size classes based on position
  const sizeClasses = {
    right: { sm: "w-80", md: "w-96", lg: "w-[32rem]" },
    left: { sm: "w-80", md: "w-96", lg: "w-[32rem]" },
    top: { sm: "h-80", md: "h-96", lg: "h-[32rem]" },
    bottom: { sm: "h-80", md: "h-96", lg: "h-[32rem]" },
  };

  // Transform classes for animation
  const transformClasses = {
    right: isOpen ? "translate-x-0" : "translate-x-full",
    left: isOpen ? "translate-x-0" : "-translate-x-full",
    top: isOpen ? "translate-y-0" : "-translate-y-full",
    bottom: isOpen ? "translate-y-0" : "translate-y-full",
  };

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && closable) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closable, closeOnEscape, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && closable && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={handleOverlayClick}>
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black transition-opacity duration-300",
          isOpen ? "bg-opacity-50" : "bg-opacity-0"
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
          "flex flex-col overflow-hidden",
          positionClasses[position],
          sizeClasses[position][size],
          transformClasses[position],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b bg-white">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && closable && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
