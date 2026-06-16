export default function ProfileCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-black/[0.04] dark:border-white/[0.04] rounded-[2rem] p-6 flex flex-col items-center text-center animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-24 h-24 bg-gray-200 dark:bg-zinc-800 rounded-full mb-4"></div>
      
      {/* Name skeleton */}
      <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded-lg w-2/3 mb-2"></div>
      
      {/* Course & Shift skeleton */}
      <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-lg w-1/2 mb-4"></div>
      
      {/* Goal badge skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-full w-4/5 mb-6"></div>
      
      {/* Skills header skeleton */}
      <div className="w-full text-left mb-2 flex justify-center">
        <div className="h-3 bg-gray-100 dark:bg-zinc-800/60 rounded-md w-1/3 mb-1"></div>
      </div>
      
      {/* Skills tags skeletons */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-6 w-full">
        <div className="h-6 bg-gray-100 dark:bg-zinc-800/60 rounded-lg w-1/4"></div>
        <div className="h-6 bg-gray-100 dark:bg-zinc-800/60 rounded-lg w-1/3"></div>
        <div className="h-6 bg-gray-100 dark:bg-zinc-800/60 rounded-lg w-1/5"></div>
      </div>
      
      {/* Action button skeleton */}
      <div className="w-full mt-auto h-11 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
    </div>
  )
}
