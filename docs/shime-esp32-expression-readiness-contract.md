# Shime ESP32 Expression Readiness Contract

The readiness contract defines gates that must pass before any future firmware parser implementation.

Required gates include stable envelope schema, generated golden fixtures, host simulator pass, validator pass, serializer round-trip pass, rejected unsafe attacks, locked motion, no motor/servo commands, no radio implementation requirement, manual QA plan, rollback plan, isolated firmware scope, and no real app-to-robot send path.

This phase does not modify firmware. The next real firmware step must be log-only parser planning/review before implementation.

