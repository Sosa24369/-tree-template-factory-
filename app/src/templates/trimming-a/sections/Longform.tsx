/**
 * S10 (part 1) — the long-form SEO block: badge, headline, lede, two body
 * paragraphs and the seven "Common Tree Trimming Requests We Handle".
 *
 * In the source the lede, both long paragraphs AND an empty spacer between them are
 * all marked up as <h2> (structure.md §4). They are body prose that happens to be
 * wearing heading tags, so they are rendered as prose here — a design decision that
 * also stops a screen reader announcing three paragraphs of marketing copy as page
 * headings. Not one character of the strings changes.
 *
 * longform.spacer is the empty <h2>. It is kept as a copy key so the block is
 * complete, and <SafeText/> renders nothing for it, which is precisely what an empty
 * spacer element contributed.
 *
 * The source also carries a photo in this block, one asset per breakpoint. It is a
 * client photograph slot, and all three of those are already allocated (slots.ts),
 * so this block is set as type instead — a measured column and a card of requests.
 */

import { SafeText } from '../../../components/Safe';
import { CheckIcon, Rule, Section, SplitHeading, type Copy } from './shared';

const REQUESTS = [1, 2, 3, 4, 5, 6, 7];

export function Longform({ copy }: { copy: Copy }) {
  const requests = REQUESTS.map((n) => copy(`longform.request${n}`)).filter((text) => text.trim());

  return (
    <Section tone="canvas" className="ta-longform">
      <div className="ta-longform-grid">
        <div className="ta-longform-main">
          <SafeText as="p" className="ta-eyebrow" value={copy('longform.badge')} />
          <Rule />
          <SplitHeading as="h2" className="ta-h2" parts={[copy('longform.h1a'), copy('longform.h1b')]} />
          <SafeText as="p" className="ta-longform-lede" value={copy('longform.lede')} />
          <SafeText as="p" className="ta-body" value={copy('longform.p1')} />
          <SafeText as="p" className="ta-body" value={copy('longform.spacer')} />
          <SafeText as="p" className="ta-body" value={copy('longform.p2')} />
        </div>

        {requests.length > 0 && (
          <aside className="ta-requests">
            <SplitHeading
              as="h3"
              className="ta-h3"
              parts={[copy('longform.requestsH1a'), copy('longform.requestsH1b')]}
            />
            <ul className="ta-request-list">
              {requests.map((text, i) => (
                <li key={i}>
                  <span className="ta-request-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <SafeText as="span" value={text} />
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </Section>
  );
}
