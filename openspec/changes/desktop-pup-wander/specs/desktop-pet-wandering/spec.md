## ADDED Requirements

### Requirement: Transparent desktop pet window
The system SHALL present the pet in a transparent, borderless window that remains above ordinary desktop windows and is not displayed in the taskbar.

#### Scenario: Pet application starts
- **WHEN** the user starts the application
- **THEN** a transparent pet window containing the dog appears above the desktop
- **AND** no standard application frame or taskbar entry is shown for the pet window

### Requirement: Continuous in-bounds wandering
While the dog is not in an interaction pose, the system SHALL update its window position continuously within the work area of its current display.

#### Scenario: Dog starts wandering
- **WHEN** the pet window has loaded and the dog is not interacting
- **THEN** the dog displays a walking or wriggling animation
- **AND** the pet window position changes over time

#### Scenario: Work area excludes system-reserved space
- **WHEN** determining the movement limits for a display
- **THEN** the system uses that display's operating-system work area
- **AND** the dog window does not move into the taskbar or other reserved edge area

### Requirement: Boundary reversal
The system SHALL keep the full pet window inside the current display work area and reverse movement on each axis independently when its next position reaches that axis's boundary.

#### Scenario: Dog reaches a horizontal boundary
- **WHEN** the next horizontal position would place any part of the pet window outside the left or right work-area edge
- **THEN** the window position is constrained to that edge
- **AND** the horizontal velocity changes to the opposite direction

#### Scenario: Dog reaches a vertical boundary
- **WHEN** the next vertical position would place any part of the pet window outside the top or bottom work-area edge
- **THEN** the window position is constrained to that edge
- **AND** the vertical velocity changes to the opposite direction
