import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";
import { mailtoHref, oneLine } from "./format";
import { COLOR, FOOTER_ADDRESS, RESPONSIVE_CSS, SITE_URL, textStyle } from "./theme";

export function EmailLayout({
  preview,
  eyebrow,
  title,
  children,
}: {
  preview: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>{RESPONSIVE_CSS}</style>
      </Head>
      <Body style={bodyStyle}>
        <Preview>{preview}</Preview>
        <Container style={containerStyle}>
          <Section style={headerStyle} className="email-pad">
            <Text style={wordmarkStyle}>CerpaMedia</Text>
          </Section>
          <Section style={contentStyle} className="email-pad">
            {eyebrow ? <Text style={eyebrowStyle}>{eyebrow}</Text> : null}
            <Heading as="h1" style={titleStyle}>
              {title}
            </Heading>
            {children}
          </Section>
          <Section style={footerStyle} className="email-pad">
            <Text style={footerTextStyle}>{FOOTER_ADDRESS}</Text>
            <Text style={footerLinkRowStyle}>
              <Link href={SITE_URL} style={footerLinkStyle}>
                cerpamedia.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={paragraphStyle}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={mutedStyle}>{children}</Text>;
}

export function Subheading({ children }: { children: ReactNode }) {
  return (
    <Heading as="h2" style={subheadingStyle}>
      {children}
    </Heading>
  );
}

export function Bullet({ children }: { children: string }) {
  return <Text style={bulletStyle}>{`• ${children}`}</Text>;
}

export function TextBlock({
  text,
  style,
}: {
  text: string;
  style?: CSSProperties;
}) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, index) => (
        <Text key={index} style={{ ...valueStyle, ...style, margin: "0" }}>
          {line.length > 0 ? line : "\u00A0"}
        </Text>
      ))}
    </>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <Section style={fieldStyle}>
      <Text style={labelStyle}>{label}</Text>
      <TextBlock text={value} />
    </Section>
  );
}

export function PrimaryButton({
  href,
  label,
  target = "_blank",
}: {
  href: string;
  label: string;
  target?: "_blank" | "_self";
}) {
  return (
    <Section style={buttonWrapStyle}>
      <Button href={href} target={target} className="stack-btn" style={buttonStyle}>
        {label}
      </Button>
    </Section>
  );
}

export function ReplyButton({ name, email }: { name: string; email: string }) {
  const href = mailtoHref(email);
  if (!href) return null;
  const label = `Reply to ${oneLine(name) || "sender"}`;
  return <PrimaryButton href={href} label={label} target="_self" />;
}

export function DetailBox({ children }: { children: ReactNode }) {
  return <Section style={detailBoxStyle}>{children}</Section>;
}

export function NoteBox({ children }: { children: ReactNode }) {
  return <Section style={noteBoxStyle}>{children}</Section>;
}

const bodyStyle = textStyle({
  backgroundColor: COLOR.bg,
  margin: "0",
  padding: "24px 12px",
  color: COLOR.text,
});

const containerStyle: CSSProperties = {
  maxWidth: "600px",
  width: "100%",
  backgroundColor: COLOR.surface,
  border: `1px solid ${COLOR.border}`,
};

const headerStyle: CSSProperties = {
  backgroundColor: COLOR.ink,
  padding: "22px 32px",
};

const wordmarkStyle = textStyle({
  color: COLOR.inverse,
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: 600,
  letterSpacing: "0.01em",
  margin: "0",
});

const contentStyle: CSSProperties = {
  backgroundColor: COLOR.surface,
  padding: "32px 32px 12px",
};

const titleStyle = textStyle({
  fontSize: "24px",
  lineHeight: "32px",
  fontWeight: 600,
  color: COLOR.text,
  margin: "0 0 20px",
});

const eyebrowStyle = textStyle({
  fontSize: "12px",
  lineHeight: "16px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: COLOR.muted,
  margin: "0 0 8px",
});

const paragraphStyle = textStyle({
  fontSize: "16px",
  lineHeight: "24px",
  color: COLOR.text,
  margin: "0 0 16px",
});

const mutedStyle = textStyle({
  fontSize: "14px",
  lineHeight: "22px",
  color: COLOR.muted,
  margin: "0 0 16px",
});

const subheadingStyle = textStyle({
  fontSize: "18px",
  lineHeight: "24px",
  fontWeight: 600,
  color: COLOR.text,
  margin: "8px 0 12px",
});

const bulletStyle = textStyle({
  fontSize: "16px",
  lineHeight: "24px",
  color: COLOR.text,
  margin: "0 0 8px",
});

const fieldStyle: CSSProperties = {
  borderBottom: `1px solid ${COLOR.border}`,
  padding: "12px 0",
};

const labelStyle = textStyle({
  fontSize: "12px",
  lineHeight: "16px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: COLOR.muted,
  margin: "0 0 4px",
});

const valueStyle = textStyle({
  fontSize: "16px",
  lineHeight: "24px",
  color: COLOR.text,
  margin: "0",
  wordBreak: "break-word",
});

const buttonWrapStyle: CSSProperties = {
  margin: "4px 0 24px",
};

const buttonStyle = textStyle({
  backgroundColor: COLOR.ink,
  color: COLOR.inverse,
  fontSize: "16px",
  lineHeight: "20px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center",
  boxSizing: "border-box",
  paddingTop: "14px",
  paddingBottom: "14px",
  paddingLeft: "28px",
  paddingRight: "28px",
});

const detailBoxStyle: CSSProperties = {
  backgroundColor: COLOR.bg,
  borderLeft: `4px solid ${COLOR.ink}`,
  padding: "16px 20px",
  margin: "0 0 8px",
};

const noteBoxStyle: CSSProperties = {
  backgroundColor: COLOR.bg,
  border: `1px solid ${COLOR.border}`,
  padding: "16px",
  margin: "0 0 16px",
};

const footerStyle: CSSProperties = {
  backgroundColor: COLOR.footer,
  borderTop: `1px solid ${COLOR.border}`,
  padding: "20px 32px 24px",
};

const footerTextStyle = textStyle({
  fontSize: "13px",
  lineHeight: "20px",
  color: COLOR.muted,
  margin: "0",
});

const footerLinkRowStyle = textStyle({
  fontSize: "13px",
  lineHeight: "20px",
  margin: "4px 0 0",
});

const footerLinkStyle = textStyle({
  color: COLOR.text,
  fontSize: "13px",
  textDecoration: "underline",
});
