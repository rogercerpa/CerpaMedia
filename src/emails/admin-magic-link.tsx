import { oneLine, safeHttpUrl } from "./format";
import { EmailLayout, Muted, Paragraph, PrimaryButton, TextBlock } from "./layout";
import { textStyle } from "./theme";

export interface AdminMagicLinkProps {
  magicLink: string;
}

export function AdminMagicLinkEmail({ magicLink }: AdminMagicLinkProps) {
  const href = safeHttpUrl(magicLink);
  const visibleLink = href ?? oneLine(magicLink);

  return (
    <EmailLayout
      preview="This link expires in 15 minutes."
      title="CerpaMedia Admin"
    >
      <Paragraph>Click the link below to sign in to the admin panel:</Paragraph>
      {href ? <PrimaryButton href={href} label="Sign In to Admin Panel" /> : null}
      <Muted>
        This link expires in 15 minutes. If you didn&apos;t request this, you can safely ignore this email.
      </Muted>
      <Muted>Or copy and paste this URL into your browser:</Muted>
      <TextBlock
        text={visibleLink}
        style={textStyle({
          fontSize: "14px",
          lineHeight: "22px",
          wordBreak: "break-all",
        })}
      />
    </EmailLayout>
  );
}
