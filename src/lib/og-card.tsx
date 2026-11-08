export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

function MarkCell() {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        background: "#ffffff",
        borderRadius: 5,
      }}
    />
  );
}

function Mark() {
  return (
    <div
      style={{
        width: 64,
        height: 64,
        background: "#0A0A0A",
        display: "flex",
        flexWrap: "wrap",
        padding: 8,
        gap: 4,
      }}
    >
      <MarkCell />
      <MarkCell />
      <MarkCell />
      <MarkCell />
    </div>
  );
}

export function OgCard({
  kicker,
  title,
  detail = "cerpamedia.com",
}: {
  kicker?: string;
  title: string;
  detail?: string;
}) {
  const titleSize = title.length > 90 ? 46 : title.length > 60 ? 56 : 68;
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        color: "#0A0A0A",
        padding: "72px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Mark />
        <div
          style={{
            display: "flex",
            marginLeft: 20,
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "-0.03em",
          }}
        >
          CerpaMedia
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {kicker ? (
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#525252",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: "-0.035em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#525252" }}>{detail}</div>
    </div>
  );
}
