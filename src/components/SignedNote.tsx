export default function SignedNote({
  text,
  name = "Roger Cerpa",
}: {
  text: string;
  name?: string;
}) {
  return (
    <figure className="border border-border bg-bg-subtle p-6 md:p-8">
      <blockquote className="text-[15px] md:text-base text-text leading-relaxed whitespace-pre-line">
        {text}
      </blockquote>
      <figcaption className="mt-6">
        <p className="font-serif italic text-xl text-text">{name}</p>
        <p className="text-sm text-text-muted mt-1">CerpaMedia · Woodstock, GA</p>
      </figcaption>
    </figure>
  );
}
