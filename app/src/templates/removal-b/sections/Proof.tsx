/**
 * S4 — proof, and it sits BEFORE the offer. That inversion is the second half of
 * this variant's bet: removal-a shows the discount in the H1 and the reviews two
 * thirds of the way down; here the reviews and the credentials are the first
 * substantial thing after the diagnostic, and the money is not mentioned yet.
 *
 * The heading says so out loud — "read the reviews before you read the offer" —
 * which only works because the page really is ordered that way.
 *
 * Review CONTENT is client data (client.reviews[]), never copy. The star row and
 * the source label are drawn as inline SVG and text rather than pulled from a
 * bundled glyph file, so nothing here points at another client's asset folder.
 *
 * R5: a client with no reviews still has credentials, so the stat band renders on
 * its own and the review-specific heading is dropped rather than left hanging over
 * an empty row.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { Eyebrow, Heading, Section, type Copy } from './shared';

const STATS = [1, 2, 3];

export function Proof({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const reviews = (client.reviews ?? []).filter((r) => (r?.body ?? '').trim() || (r?.author ?? '').trim());

  const stats = STATS.map((n) => ({
    value: copy(`proof.stat${n}.value`),
    label: copy(`proof.stat${n}.label`),
  })).filter((stat) => stat.value.trim());

  if (stats.length === 0 && reviews.length === 0) return null;

  return (
    <Section tone="ink" className="rb-proof">
      {reviews.length > 0 && (
        <div className="rb-head rb-rise">
          <Eyebrow>{copy('proof.eyebrow')}</Eyebrow>
          <Heading as="h2" className="rb-h2" parts={[copy('proof.h2a'), copy('proof.h2b')]} />
          <SafeText as="p" className="rb-lede" value={copy('proof.lede')} />
        </div>
      )}

      {stats.length > 0 && (
        <ul className="rb-stats rb-rise">
          {stats.map((stat, i) => (
            <li className="rb-stat" key={i}>
              <SafeText as="span" className="rb-stat-value" value={stat.value} />
              <SafeText as="span" className="rb-stat-label" value={stat.label} />
            </li>
          ))}
        </ul>
      )}

      {/* CANONICAL STRUCTURE (2026-08-12): the reviews slider moved to
          position 2, directly under the hero (see index.tsx). This section
          keeps its heading copy and the stat band. */}
    </Section>
  );
}
