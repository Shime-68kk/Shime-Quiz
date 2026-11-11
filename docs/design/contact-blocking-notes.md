# Scene 01 Contact Blocking Review Notes (BIG-UPDATE-14.7)

## 1. Single World Coordinate Space
- **Canvas Size**: 1000 × 600 units.
- **Column Contact Plane**: Fixed vertical line at `X = 720.00` in World Space.
- **Robot Bounding Shell**: Radius `R = 90` units.
- **Camera Configurations**:
  - **Desktop Viewport**: Crop around contact zone, scale = `0.50`.
  - **Mobile Viewport**: Crop around contact zone (vertical aspect), scale = `0.35`.

## 2. Geometric Anchors & Collision Formula
- **Robot Contact Point**: `ROBOT_CONTACT_POINT = center_x + R * scaleX * cos(rotation)`.
- **Contact Onset (t = tC = 3.840s)**:
  - `ROBOT_CONTACT_POINT` meets `COLUMN_CONTACT_PLANE` (720.00).
  - Rotation is `-10` degrees.
  - Squash starts: `scaleX` drops from `1.0` to `0.93` (Desktop) and `0.94` (Mobile).
  - Controlled penetration/overlap: `6.2` units in World Space.
    - **Desktop Overlap**: `6.2 * 0.50 = 3.10 px` (Visual squash match).
    - **Mobile Overlap**: `6.2 * 0.35 = 2.17 px` (Visual squash match).
  - Pre-contact gap at `t = 3.807s` (Pre-1, 33ms before hit):
    - `ROBOT_CONTACT_POINT` is at `708.50` units.
    - Gap in World Space is `11.5` units.
    - **Desktop Gap**: `11.5 * 0.50 = 5.75 px` (Clear visible gap).
    - **Mobile Gap**: `11.5 * 0.35 = 4.02 px` (Clear visible gap).

## 3. Five-Stage Sequence
1. **PRE-CONTACT (tC - 350ms to tC - 120ms)**: Descending from Hop 3. Eyes: `ATTENTION` (size 34×38, look right towards butterfly). No blink/sweat/overload.
2. **LATE REALIZATION (tC - 120ms to tC)**: Head rotates forward (`-10` deg). Eyes: transition to `SCARED` (sweat, horizontal/vertical flicker, eyes remain open).
3. **CONTACT ONSET (tC = 3.840s)**: Surfaces clash. `BLINK_FAST` begins instantly (eyes closed to a flat 3px line).
4. **CONTACT HOLD (tC to tC + 84ms)**: Hold for `84ms`. Robot squashed (`scaleX: 0.93`, `scaleY: 1.05`). Column wiggles slightly (`translateX: 3px`, `rotateZ: 0.8deg` peak). 2–3 stone chips fly. No `OVERLOADED`.
5. **RELEASE / REBOUND (tC + 84ms to tC + 800ms)**: Robot bounces backward/upward, spinning. Eyes linger closed for `150ms`, then reopen to `NEUTRAL`.

## 4. Visual Verification
All trajectories are dynamically rendered in the interactive sandbox:
- File URL: `docs/design/contact-blocking-sandbox.html`
- A 300ms hold is implemented at `3.840s` during playback for split-screen comparison.
- 7 static frames are rendered at the bottom for instant visual alignment checking.
