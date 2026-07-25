## Context

This project has no existing desktop application implementation. The change introduces a small Windows desktop pet using Electron. The required behavior spans a native window lifecycle and a rendered character state, so the main process and renderer must coordinate without exposing unrestricted Node.js APIs to the page.

## Goals / Non-Goals

**Goals:**

- Display one friendly dog in a transparent, frameless desktop window.
- Move the entire window smoothly inside the current display work area and reverse at each boundary.
- Toggle between walking and a user-facing, tongue-out interaction pose on click.
- Keep platform integration in the Electron main process and presentation in the renderer.

**Non-Goals:**

- Dragging, resizing, settings, system tray controls, autostart, sound, persistence, or notifications.
- Cross-display wandering; the pet remains within its initial/current display work area.
- Click-through transparent pixels, physics, obstacle avoidance, or multiple pets.
- A generated bitmap asset pipeline; the first version uses a code-rendered dog so it runs without external assets.

## Decisions

### Decision: Use Electron with a dedicated transparent BrowserWindow

The application will use a fixed-size `BrowserWindow` configured as transparent, frameless, non-resizable, always-on-top, and skipped from the taskbar. Electron provides the desktop-window controls and display work-area information required by the change while allowing the dog animation to be built with normal web rendering.

Alternative considered: native Win32 implementation. It would provide lower overhead but would slow down the first product slice and make the animated illustration more expensive to iterate on.

### Decision: Keep position and velocity authoritative in the main process

The main process will hold `{ x, y }` velocity and run a short fixed-interval movement loop. On every tick it will obtain the pet window bounds, find the nearest display, calculate the maximum allowable origin from that display's `workArea`, clamp the next position, and negate only the velocity component that crossed a boundary.

This prevents renderer visual state from becoming the source of truth for native window placement and guarantees whole-window containment. The renderer receives direction/state events only to select an animation or facing direction.

Alternative considered: CSS translation inside a full-screen overlay. That would require a desktop-sized transparent overlay window and would complicate input handling, taskbar interaction, and multi-display coordinates.

### Decision: Use explicit finite interaction states

The renderer will model `wandering` and `cute` states. A click switches from `wandering` to `cute`, sends a pause command to the main process, removes walking motion, points the face toward the user, and shows a tongue. A second click switches back, resumes the movement loop, and restores the walking animation.

Alternative considered: only changing the illustration while the window continues moving. This would not meet the expected focus of a click response and would make the pose harder to notice.

### Decision: Isolate renderer communication through preload IPC

The preload script exposes a small, named API for pausing/resuming movement and receiving direction changes. `contextIsolation` remains enabled and direct Node integration remains disabled.

Alternative considered: enabling Node in the renderer. That is unnecessary for this feature and broadens the renderer's privilege surface.

## Risks / Trade-offs

- [Always-on-top behavior varies with full-screen applications] -> use Electron's documented always-on-top level and verify on the target Windows version.
- [Timer jitter can make movement feel uneven on busy systems] -> use a small movement step and keep each tick limited to arithmetic and one native position update.
- [A transparent window still has a rectangular click region] -> accept the full pet window as clickable in the initial version; pixel-perfect click-through is explicitly out of scope.
- [Work-area size can change while the application is running] -> calculate the work area on each movement tick and clamp immediately after a boundary change.

## Migration Plan

1. Install Electron and add the application entry points.
2. Implement and manually verify the window and movement loop.
3. Add the rendered dog and interaction-state IPC.
4. Run the application on Windows, checking every edge and both click states.

Rollback is removing the new Electron application files and dependency because this is a new standalone application with no persisted data or external interfaces.

## Open Questions

- The first version will use one dog size and speed. Exact values can be tuned after visual testing and do not change the behavioral contract.
