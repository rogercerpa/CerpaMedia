export default function PhotoNeeded({ label }: { label: string }) {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center border border-dashed border-border bg-bg-subtle">
      <p className="text-sm text-text-muted px-4 text-center">
        Photo needed from Roger
        <span className="block text-xs mt-1">{label}</span>
      </p>
    </div>
  );
}
