// components/TableLoadingSpinner.tsx
"use client";

interface TableLoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string | null;
}

export const TableLoadingSpinner: React.FC<TableLoadingSpinnerProps> = ({
  size = "large",
  message = null,
}) => {
  const loadingMessage = message || "Ачааллаж байна...";

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <div className="relative mx-auto" style={{ width: "fit-content" }}>
          <div
            className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full`}
          ></div>
          <div
            className={`${sizeClasses[size]} border-4 border-transparent border-t-indigo-600 rounded-full absolute top-0 left-0`}
            style={{
              animation: "smoothSpin 1s linear infinite",
            }}
          ></div>
          <div
            className={`${sizeClasses[size]} border-2 border-transparent border-r-indigo-400 rounded-full absolute top-1 left-1`}
            style={{
              width: `calc(${sizeClasses[size]
                .split(" ")[0]
                .replace("w-", "")} * 0.25rem - 0.5rem)`,
              height: `calc(${sizeClasses[size]
                .split(" ")[1]
                .replace("h-", "")} * 0.25rem - 0.5rem)`,
              animation: "smoothSpin 1.5s linear infinite reverse",
            }}
          ></div>
        </div>
        <div>
          <p
            className={`${
              size === "large" ? "text-lg" : "text-base"
            } font-semibold text-gray-900 dark:text-white`}
          >
            {loadingMessage}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Түр хүлээнэ үү...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes smoothSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
