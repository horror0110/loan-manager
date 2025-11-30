import { Button } from "@/components/ui/button";
import { AlertCircle, Menu, X, ArrowLeft, LucideIcon } from "lucide-react";
import React, { ReactNode } from "react";

// Types
interface Statistic {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
}

interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "secondary"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

interface GanaaHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon | null;
  error?: boolean;
  statistics?: Statistic[];
  actions?: Action[];
  mobileActions?: Action[];
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  mobileMenuContent?: ReactNode;
  className?: string;
  rightContent?: ReactNode;
  onBack?: (() => void) | null;
}

const GanaaHeader: React.FC<GanaaHeaderProps> = ({
  title,
  subtitle,
  icon: IconComponent,
  error = false,
  statistics = [],
  actions = [],
  mobileActions = [],
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
  mobileMenuContent,
  className = "",
  rightContent,
  onBack,
}) => {
  return (
    <div
      className={`bg-white rounded-xl dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm ${className}`}
    >
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Буцах"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {/* Icon Section */}
            {IconComponent && (
              <div className="bg-blue-500 p-3 rounded-lg shrink-0">
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            )}

            {/* Title and Info Section */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {title}
                </h1>
                {error && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      System Error
                    </span>
                  </div>
                )}
              </div>

              {subtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}

              {/* Statistics */}
              {statistics.length > 0 && (
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {statistics.map((stat, index) => {
                    const StatIcon = stat.icon;
                    return (
                      <span
                        key={index}
                        className="flex items-center gap-0.5 sm:gap-1"
                      >
                        {StatIcon && (
                          <StatIcon className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                        )}
                        {stat.value} {stat.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Actions & Right Content */}
          <div className="hidden sm:flex items-center gap-2">
            {rightContent}
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || "outline"}
                  size={action.size || "sm"}
                  disabled={action.disabled}
                  className={
                    action.className ||
                    "text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
                  }
                >
                  {ActionIcon && (
                    <ActionIcon
                      className={`h-4 w-4 mr-2 ${
                        action.loading ? "animate-spin" : ""
                      }`}
                    />
                  )}
                  {action.label}
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          {(mobileActions.length > 0 || mobileMenuContent || rightContent) &&
            setIsMobileMenuOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-1.5 text-slate-600 dark:text-slate-400"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen &&
          (mobileActions.length > 0 || mobileMenuContent || rightContent) && (
            <div className="sm:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              {/* Mobile Right Content */}
              {rightContent && <div className="w-full">{rightContent}</div>}

              {/* Mobile Actions */}
              {(mobileActions.length > 0 || onBack) && (
                <div className="flex gap-2">
                  {/* Mobile Back Button */}
                  {onBack && (
                    <Button
                      onClick={onBack}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Буцах
                    </Button>
                  )}
                  {mobileActions.map((action, index) => {
                    const ActionIcon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant={action.variant || "outline"}
                        size={action.size || "sm"}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={`flex-1 ${
                          action.className ||
                          "text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {ActionIcon && (
                          <ActionIcon
                            className={`h-4 w-4 mr-2 ${
                              action.loading ? "animate-spin" : ""
                            }`}
                          />
                        )}
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Additional Mobile Content */}
              {mobileMenuContent}
            </div>
          )}
      </div>
    </div>
  );
};

export default GanaaHeader;
