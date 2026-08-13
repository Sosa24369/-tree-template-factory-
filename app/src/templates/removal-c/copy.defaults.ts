/**
 * removal-c — THE HYBRID. COPY IS removal-a's, BYTE-IDENTICAL BY CONSTRUCTION.
 *
 * No strings live here: this re-exports the removal CONTROL's copy object, so
 * the two cannot drift — an edit to removal-a's copy IS an edit to removal-c's.
 * The source client's copyOverrides['removal-a'] (its source-exact strings)
 * apply here too, via makeCopy's inheritOverridesFrom (see index.tsx).
 *
 * HYPOTHESIS (Design Elevation 2026-08-12): the control's proven message —
 * the $300 offer in the H1, its exact body copy, FAQ and long-form — delivered
 * in removal-b's design direction (ink-and-brand layered surfaces, text-led
 * hero, credential weight) executed at a premium level, converts better than
 * either parent. Copy is the constant; design is the only thing that moved.
 *
 * You are not a copywriter this session: if a line here looks wrong, it is the
 * control's line — flag it, never edit it here (there is nothing here to edit).
 */

export { removalACopy as removalCCopy } from '../removal-a/copy.defaults';
