# BIG-UPDATE-14 OLED Firmware Audit

## Gate Status

**DESIGN READY — RUNTIME NOT APPROVED YET.** This audit supports the revised character acting storyboard approval gate for **Scene 01 Causality Reset** (BIG-UPDATE-14.6). No app production runtime or firmware files have been changed.

## Read-Only Source Reference

Reference root: `/home/quang/Documents/PlatformIO/Projects/rf_robot2_ver2_stable`

| File | SHA-256 before storyboard reset |
| --- | --- |
| `src/config.h` | `71c192b5164d2324702d8809b71a1c456b2198f1385a42430f412b9c95dd4efd` |
| `src/display.h` | `e785cf87d11fd797a69bb080c908be12de5874a4f74956309991b40cfd3b2d62` |
| `src/FluxGarage_RoboEyes.h` | `969db426f8e9399054b3ab6cb8c0326f0836e9e9e68b4ff3f3df8f186b720c1e` |
| `src/blink.h` | `fe36bcc75d7b01cfa9772e3bdb80a61a1a184c316b22adb4d8d2277e8a034019` |
| `src/robot_oled_face_ui.h` | `b36290fcbecb74a2499a36615655df68ebea3a29ecdd3e41dd907fe85e7e0d65` |
| `src/robot_expression_arbitrator.cpp` | `4d0b526b85e41f82d0b16641f45018905cb78dd333eea54c3e90e34eec1401b8` |

The firmware files remain strictly read-only and serve as the mathematical source of truth for eye coordinates, shapes, and blink cycles.

## Physical Display Contract & Alignment

To ensure the web app's robot representation matches the physical robot exactly, the cinematic assets and OLED faces follow these strict rules:

1. **Resolution & Viewport**: All SVG eyes and screens are mapped to a local coordinate space of `128 × 64`.
2. **Neutral Dimensions**: Standard eye width is `32px`, height is `36px`, corner radius is `8px`, and the inter-eye gap is `10px`. Centered coordinates are Left `(27, 14)` and Right `(69, 14)`.
3. **Attention Dimensions**: Eye geometry expands to `34 × 38` at Left `(25, 13)` and Right `(69, 13)`.
4. **Hardware Eyelids**: Eyelids are rendered by masking the active eye region with background-colored polygons (black SSD1306 surface), preserving the roundness of the bottom/outer corners where appropriate.

## Expression & State Mapping for Scene 01 Causality

The sequence uses ONLY the standard expressions defined in the firmware to ensure identity consistency:

* **`NEUTRAL`** (0.00s - 1.10s):
  * C++: `baseEyes();` (default 32x36, rx: 8, gap: 10, autoblinker ON, idle ON).
* **`CURIOUS`** (1.10s - 1.70s):
  * C++: `setCuriosity(ON); setIdleMode(ON, 2, 2);`
  * Gaze shifted towards the butterfly path.
* **`ATTENTION`** (1.70s - 3.50s, 6.55s - 6.80s):
  * C++: `setWidth(34, 34); setHeight(38, 38); setIdleMode(OFF);`
  * Locked eye gaze tracking the butterfly.
* **`SCARED`** (3.50s - 3.72s):
  * C++: `setMood(ROBOEYES_TIRED); setSweat(ON); setVFlicker(ON, 3); setHFlicker(ON, 3);`
  * Eyelids cover top and bottom edges (7px mask).
* **`BLINK_FAST`** (3.72s - 3.92s, 3.92s - 4.10s):
  * C++: `blink();` (closes eyes down to 3px flat line).
  * No electricity/fainting before this frame.
* **`OVERLOADED`** (4.10s - 5.92s):
  * C++: `setMood(ROBOEYES_TIRED); setSweat(ON); setHFlicker(ON, 2); setVFlicker(ON, 1);`
  * Dizzy dual spirals. Scanlines and 2-4 sparks triggered only **after** complete landing (t >= 5.08s).
* **`SLEEPY`** (5.92s - 6.20s):
  * C++: `setMood(ROBOEYES_TIRED); setHeight(20, 20);`
* **`ANGRY_ALERT`** (6.80s - 7.55s):
  * C++: `setMood(ROBOEYES_ANGRY); setHFlicker(ON, 2); setIdleMode(OFF);`

## RoboEyes C++ Interpolation & Confused Animation

1. **Interpolation**:
   * FluxGarage_RoboEyes uses a trailing average for coordinates and sizes: `current = (current + target) / 2`.
   * The web simulator emulates this transition with a smooth linear interpolation factor (`lerp = 0.25`) to prevent instantaneous snap changes.
2. **Confused Animation (`anim_confused()`)**:
   * Sets `confused = 1` which invokes `setHFlicker(1, 20)` for 500ms.
   * Modulated in the animatic as a decaying horizontal shake (center → left → right → left nhỏ → right nhỏ → center) instead of static frequency vibration.

## Proposed Architecture Boundary

* **No external dependencies**: Only vanilla SVG and WAAPI (Web Animations API) synchronized with `document.timeline.currentTime`.
* **Zero side effects**: No use of `setTimeout`, `setInterval`, `requestAnimationFrame`, or random noise in runtime. All timings are fully deterministic.
* **Storage Independence**: The launch gate maintains its session-lifetime and document-lifetime replay flags purely in React memory state, without altering persistent user data or study scheduler.
