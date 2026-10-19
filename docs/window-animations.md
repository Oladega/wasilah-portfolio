# Shared window animation engine

Motion remains the only animation dependency. `WindowTransitionLayer` and `windowVisualSnapshot` use measured desktop-icon/window rectangles for opening/closing and saved geometry for maximize/unmaximize. There are no dock or minimization transitions.

The real React document stays mounted throughout a transition. A temporary inert visual copy, including PDF canvas pixels and scroll offsets, owns each flight. The real window is hidden before paint. Entrance reveals it before removing the copy; exit keeps it hidden until React settlement. Glass is on the outer visual owner to preserve backdrop sampling. The copy belongs to its application's stacking context.

Latest actions freeze and retarget earlier copies; versioned IDs reject stale callbacks. Use `cancel()` rather than deferred style-committing `stop()`. Resize and runtime reduced-motion changes settle immediately; unavailable animation APIs use the immediate path. Missing/offscreen desktop icons use a short fade.

Configuration is in `windowTransitionUtils.ts`: open 400ms, close 340ms, size transitions 270ms. Only transform/opacity animate. Geometry is read at transition boundaries, with no per-frame React state updates. `will-change` exists only on temporary visual owners and is removed with them.

`test:window-flicker`, `test:window-animations` and `test:window-handoff-pixels` verify ownership, geometry, frame boundaries, interruption, cleanup and representative final appearance.
