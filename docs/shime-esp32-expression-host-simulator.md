# Shime ESP32 Expression Host Simulator

The host simulator models future log-only firmware parsing without modifying firmware.

It accepts serialized expression envelopes or envelope objects, validates them with the app-side protocol validator, and returns an ACCEPT or REJECT log-only result.

It does not access hardware, pins, motors, servos, radio links, storage, cloud APIs, or app runtime transport. Motion remains locked and all results are dry-run/log-only.

