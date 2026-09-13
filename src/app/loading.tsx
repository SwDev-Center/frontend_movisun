export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-14">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-muted/60 rounded-2xl p-6 animate-pulse">
            <div className="w-24 h-3 bg-muted rounded mb-3" />
            <div className="w-2/3 h-4 bg-muted rounded mb-2" />
            <div className="w-1/2 h-3 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}