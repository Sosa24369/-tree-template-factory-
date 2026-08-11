/**
 * Services grid — twelve slots, any of which may stay blank.
 *
 * The grid packs whatever is filled, so an operator who lists four things gets
 * a four-item row rather than four items and eight gaps. The section removes
 * itself when the heading, the intro and all twelve slots are blank (R5).
 *
 * Twelve was chosen because it divides cleanly into the 2- and 3-column
 * breakpoints and is roughly the point where a visitor stops reading a list.
 * The slots carry no example text: what a business sells is the one thing this
 * template can never guess (R4).
 */

import { CheckIcon, Section, SectionHead } from './shared';
import { hasText, type Copy } from '../text';

const SLOTS = 12;

export function Services({ copy }: { copy: Copy }) {
  const items: string[] = [];
  for (let n = 1; n <= SLOTS; n += 1) {
    const item = copy(`services.item${n}`);
    if (hasText(item)) items.push(item);
  }

  const eyebrow = copy('services.eyebrow');
  const heading = copy('services.h2');
  const body = copy('services.body');

  if (items.length === 0 && !hasText(eyebrow) && !hasText(heading) && !hasText(body)) return null;

  return (
    <Section tone="paper" className="ag-services">
      <SectionHead eyebrow={eyebrow} heading={heading} body={body} />

      {items.length > 0 && (
        <ul className="ag-service-grid">
          {items.map((item, i) => (
            <li className="ag-service" key={i}>
              <span className="ag-service-check" aria-hidden="true">
                <CheckIcon />
              </span>
              <span className="ag-service-text">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
