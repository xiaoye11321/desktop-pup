## ADDED Requirements

### Requirement: Click-to-cute interaction
The system SHALL toggle the dog between wandering and a cute interaction pose when the user clicks the dog.

#### Scenario: User clicks a wandering dog
- **WHEN** the user clicks the dog while it is wandering
- **THEN** the dog stops changing desktop position
- **AND** the dog faces the user and displays a visible tongue

#### Scenario: User clicks an interacting dog
- **WHEN** the user clicks the dog while it is in the cute interaction pose
- **THEN** the dog resumes wandering
- **AND** the walking or wriggling animation resumes

### Requirement: Stable interaction state
The system SHALL retain the cute interaction pose until the user clicks the dog again or the application exits.

#### Scenario: Interaction pose remains visible
- **WHEN** the dog has entered the cute interaction pose
- **THEN** subsequent movement timer updates do not change the pet window position
- **AND** the dog continues to face the user with its tongue visible
