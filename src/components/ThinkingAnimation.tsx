// ThinkingAnimation.tsx
export const ThinkingAnimation = () => (
    <div className="flex items-center justify-center space-x-2 my-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );