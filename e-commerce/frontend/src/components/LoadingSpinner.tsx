import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  fullScreen = false,
  text,
}) => {
  const dimensionMap = {
    sm: { outer: "w-6 h-6", border: "border-[3px]" },
    md: { outer: "w-10 h-10", border: "border-[3px]" },
    lg: { outer: "w-16 h-16", border: "border-4" },
  };

  const { outer, border } = dimensionMap[size];

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* Spinner Ring */}
      <div className={`relative ${outer}`}>
        {/* Track */}
        <div
          className={`absolute inset-0 ${border} border-gray-200 rounded-full`}
        />
        {/* Active Arc */}
        <div
          className={`absolute inset-0 ${border} border-transparent border-t-primary-500 rounded-full animate-spin`}
          style={{ animationDuration: "0.75s" }}
        />
        {/* Inner Dot (only for lg) */}
        {size === "lg" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Brand logo only for lg */}
      {size === "lg" && (
        <div className="text-center select-none">
          <p className="text-dark-400 font-bold tracking-[0.35em] text-sm leading-none">
            URBAN
          </p>
          <p className="text-primary-500 tracking-[0.55em] text-[10px] font-light mt-0.5">
            NILE
          </p>
        </div>
      )}

      {/* Optional text */}
      {text && (
        <p className="text-gray-400 text-xs tracking-widest uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          {/* Decorative corner lines */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-5 h-5 border-t-2 border-l-2 border-primary-500" />
            <div className="absolute -top-6 -right-6 w-5 h-5 border-t-2 border-r-2 border-primary-500" />
            <div className="absolute -bottom-6 -left-6 w-5 h-5 border-b-2 border-l-2 border-primary-500" />
            <div className="absolute -bottom-6 -right-6 w-5 h-5 border-b-2 border-r-2 border-primary-500" />
            <div className="px-10 py-8">{spinner}</div>
          </div>
          <p className="text-gray-400 text-[10px] tracking-[0.4em] uppercase animate-pulse">
            {text || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;