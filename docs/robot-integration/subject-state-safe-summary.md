# Subject State Safe Summary

`src/studyRoom/subjectRobotSafeSummary.js` prepares a future robot-facing subject-state summary.

This is not a real robot bridge. No serial, WebSocket, BLE, Wi-Fi, cloud, backend, or firmware path is enabled.

Robot-facing output is coarse only:

- subject count bucket
- highest pressure bucket
- active subject slot bucket
- suggested companion action
- companion tone
- safe summary code
- privacy class

The robot summary must not include raw question/answer text, explanations, source document text, full study history, exact subject names, or personal identity.
