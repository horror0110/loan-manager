// types/table.types.ts
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface Column {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  className?: string;
  cellClassName?: string;
  type?:
    | "badge"
    | "tag"
    | "code"
    | "phone"
    | "name"
    | "text"
    | "number"
    | "date";
  render?: (value: any, item: any) => ReactNode;
  badgeConfig?: {
    [key: string]: string | { [key: string]: string } | undefined;
    labels?: { [key: string]: string };
  };
  tagClass?: string;
}

export interface FilterOption {
  value: string | number;
  label: string;
  key?: string;
}

export interface Filter {
  key: string;
  label: string;
  type?: "select" | "text" | "number" | "date" | "dateRange";
  value?: any;
  options?: FilterOption[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  min?: number;
  max?: number;
}

export interface Action {
  title: string;
  icon?: LucideIcon;
  onClick: (item: any) => void;
  className?: string;
  disabled?: (item: any) => boolean;
}

export interface BulkAction {
  label: string;
  icon?: LucideIcon;
  onClick: (selectedIds: (string | number)[]) => void;
  className?: string;
  disabled?: boolean;
}

export interface HeaderStatistic {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
}

export interface HeaderAction {
  type?: "archive" | "themed" | "default";
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

export interface HeaderButton {
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
}

export interface GanaaDataTableProps {
  data?: any[];
  loading?: boolean;
  columns?: Column[];
  title?: string;
  subtitle?: string;
  headerIcon?: LucideIcon | null;
  headerError?: boolean;
  headerStatistics?: HeaderStatistic[];
  headerActions?: HeaderAction[];
  headerMobileActions?: HeaderAction[];
  headerRightContent?: ReactNode | null;
  headerClassName?: string;
  onBack?: (() => void) | null;
  actions?: Action[];
  primaryAction?: HeaderAction | null;
  bulkActions?: BulkAction[];
  searchPlaceholder?: string | null;
  onSearch?: ((value: string) => void) | null;
  searchValue?: string;
  filters?: Filter[];
  onFilterChange?: ((key: string, value: any) => void) | null;
  onClearFilters?: (() => void) | null;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: ((page: number) => void) | null;
  onPageSizeChange?: ((size: number) => void) | null;
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: ((selected: (string | number)[]) => void) | null;
  headerButtons?: HeaderButton[];
  className?: string;
  onRefresh?: (() => void) | null;
  responsiveBreakpoint?: number;
  enableColumnVisibility?: boolean;
  enableMobileCards?: boolean;
  compactMode?: boolean;
}
