# Shime ESP32 Expression Serial QA Kit

The serial QA kit generates future copy/paste payloads from expression golden fixtures. It is not a runtime serial transport.

Valid payloads must log ACCEPT. Invalid payloads must log REJECT. No valid payload may include raw quiz content. No test should move pins, motors, servos, or LEDs unless a later safety phase explicitly permits it.

