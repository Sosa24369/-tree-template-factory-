/**
 * S8 — the long-form SEO block: badge, headline, lede, two body paragraphs and the
 * seven "Common Requests".
 *
 * The source also carries two inline base64 photos here. They are not files, so the
 * P1 manifest has no entry for them and nothing self-hosted to point at; rather than
 * substitute a different image (images are locked, R2) the block is set as type —
 * a measured column, a rule, and a card of requests.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { altFor, withAlt } from '../assets';
import { partitionMedia, photosFor } from '../../../lib/photos';
import { CheckIcon, Section, SplitHeading, type Copy } from './shared';

/**
 * Premium Reorder v2 (2026-08-13): the services blurb is two-column on desktop
 * with a photograph of the CLIENT'S OWN work on the right, stacked below on
 * mobile. The photo is the second removal still (the hero plate leads with the
 * first); a client with no photography gets the type-only layout back.
 */
export function Longform({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const requests: string[] = [];
  for (let n = 1; n <= 7; n += 1) {
    const text = copy(`longform.request${n}`);
    if (text.trim()) requests.push(text);
  }

  const { stills } = partitionMedia(photosFor(client, 'removal'));
  const photo = stills[1] ?? stills[0] ?? null;

  return (
    <Section tone="light" className="ra-longform">
      <div className="ra-longform-grid">
        <div className="ra-longform-main">
          <SafeText as="p" className="ra-eyebrow" value={copy('longform.badge')} />
          <SplitHeading as="h2" className="ra-h2" parts={[copy('longform.h2a'), copy('longform.h2b')]} />
          <SafeText as="p" className="ra-longform-lede" value={copy('longform.lede')} />
          <SafeText as="p" className="ra-body" value={copy('longform.p1')} />
          <SafeText as="p" className="ra-body" value={copy('longform.p2')} />
        </div>

        {photo && (
          <div className="ra-longform-photo">
            <DeferredImage
              photo={photo.alt ? photo : withAlt(photo, altFor(client.name, 2))}
              className="ra-longform-photo-img"
              wrapperClassName="ra-longform-photo-box"
              sizes="(max-width: 979px) 92vw, 38vw"
            />
          </div>
        )}

        {requests.length > 0 && (
          <aside className="ra-requests">
            <SplitHeading
              as="h3"
              className="ra-h3"
              parts={[copy('longform.requestsH2a'), copy('longform.requestsH2b')]}
            />
            <ul className="ra-request-list">
              {requests.map((text, i) => (
                <li key={i}>
                  <span className="ra-request-check" aria-hidden="true">
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
