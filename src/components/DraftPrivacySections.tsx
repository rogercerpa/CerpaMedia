export const DRAFT_PRIVACY_DEMO_ANALYTICS = `
Demos. The Try It demos on this Site are replays and curated sample inputs. There is no free-text box, so we do not collect, store, or send your own text to a model when you watch a demo. Sample outputs are generated once by an admin, stored, and shown as-is. We do not keep what you paste, because we do not ask you to paste anything in this version.

Analytics. If we turn on Vercel Web Analytics, it is cookieless. We may also count four events: guide_read, demo_run, email_click, and cta_99_click. Those counts have no page content, no email addresses, and no other personal information. We do not use advertising pixels or tracking cookies for ads.
`.trim();

export default function DraftPrivacySections() {
  return (
    <div>
      <h2 className="text-3xl font-semibold text-text mb-4">
        13. Demos and analytics (draft — pending Roger&apos;s approval)
      </h2>
      <h3 className="text-xl font-medium text-text mt-6 mb-3">Interactive demos</h3>
      <p className="text-text-muted leading-relaxed mb-4">
        The Try It demos on this Site are recorded replays plus a small set of curated sample inputs. There is no free-text box. We do not collect, store, or send your own words to a model when you watch a demo. Sample outputs are generated once by an admin, cached, and shown as-is. We do not keep what you paste, because this version does not ask you to paste anything.
      </p>
      <h3 className="text-xl font-medium text-text mt-6 mb-3">Cookieless analytics</h3>
      <p className="text-text-muted leading-relaxed">
        If we turn on Vercel Web Analytics, it is cookieless. We may also record counts for four events: guide read, demo run, email click, and $99 call click. Those counts include no page content, no email addresses, and no other personal information. We do not use advertising pixels or tracking cookies for ads.
      </p>
    </div>
  );
}
