/**
 * Insurance documentation.
 *
 * The language stops at DOCUMENTATION and never implies a claim will be paid. The
 * disclaimer — "Coverage decisions are between you and your carrier" — is copy, not
 * a throwaway: it is the line that keeps a process claim from becoming a coverage
 * promise, so it renders as its own emphasised block, not buried in a paragraph.
 *
 * Blank points drop out; an empty section (no body, no points, no disclaimer)
 * hides entirely (R5).
 */

import { SafeText } from '../../../components/Safe';
import { CheckIcon, DocIcon, Eyebrow, Heading, Section, type Copy } from './shared';

const POINTS = [1, 2, 3];

export function Insurance({ copy }: { copy: Copy }) {
  const body = copy('insurance.body');
  const disclaimer = copy('insurance.disclaimer');
  const points = POINTS.map((n) => copy(`insurance.point${n}`)).filter((text) => text.trim());

  if (!body.trim() && !disclaimer.trim() && points.length === 0) return null;

  return (
    <Section tone="ink" className="st-insurance">
      <div className="st-insurance-grid">
        <div className="st-insurance-copy">
          <Eyebrow>{copy('insurance.eyebrow')}</Eyebrow>
          <Heading as="h2" className="st-h2" parts={[copy('insurance.h2a'), copy('insurance.h2b')]} />
          <SafeText as="p" className="st-lede" value={body} />

          {disclaimer.trim() && (
            <p className="st-insurance-note">
              <span className="st-insurance-note-mark" aria-hidden="true">
                <DocIcon />
              </span>
              <span>{disclaimer}</span>
            </p>
          )}
        </div>

        {points.length > 0 && (
          <ul className="st-insurance-list">
            {points.map((text, i) => (
              <li key={i}>
                <span className="st-insurance-check" aria-hidden="true">
                  <CheckIcon />
                </span>
                <SafeText as="span" value={text} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
