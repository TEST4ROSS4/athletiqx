export default function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Image */}
      <div className="flex h-12 w-12 items-center justify-center rounded-lg">
        <img
          src="/images/logo.png"
          alt="App Logo"
          className="object-contain"
        />
      </div>

      {/* App Name */}
      <div className="flex flex-col">
        <span className="text-lg font-bold font-heading tracking-wide text-brand dark:text-white">
          AthletiQX
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          Train smarter. Perform better
        </span>
      </div>
    </div>
  );
}