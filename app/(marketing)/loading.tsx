export default function MarketingLoading() {
  return (
    <div className="animate-pulse">
      <div className="hero-gradient px-4 py-24">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="mx-auto h-10 w-2/3 rounded-lg bg-white/20" />
          <div className="mx-auto h-4 w-1/2 rounded bg-white/15" />
          <div className="mx-auto h-4 w-1/3 rounded bg-white/15" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
