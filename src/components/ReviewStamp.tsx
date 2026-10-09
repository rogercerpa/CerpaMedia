export default function ReviewStamp({
  date,
  note,
}: {
  date?: string | Date | null;
  note?: string | null;
}) {
  const formatted = date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="inline-flex flex-col gap-1 border border-border px-3 py-2 text-left">
      <p className="text-xs uppercase tracking-wide text-text-muted">
        Reviewed by Roger{formatted ? `, ${formatted}` : ""}
      </p>
      {note ? (
        <p className="text-[13px] text-text-muted">{note}</p>
      ) : null}
    </div>
  );
}
