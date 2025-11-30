import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { ChevronRight, Home } from "lucide-react";

export default function CustomBreadcrumb({ items }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex flex-wrap items-center text-xs font-medium text-gray-500 sm:text-sm">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem className="transition-opacity hover:opacity-100 focus-within:opacity-100">
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-1.5 rounded px-2 py-1 outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:bg-gray-800 dark:focus:text-gray-100"
                  >
                    {index === 0 && (
                      <Home className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="rounded px-2 py-1 font-semibold text-gray-900 dark:text-gray-50">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && (
              <BreadcrumbSeparator aria-hidden>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-600" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
