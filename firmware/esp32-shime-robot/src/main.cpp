#include <Arduino.h>
#include "ShimeProtocol.h"

static const size_t MAX_SERIAL_LINE_LENGTH = 2048;
static String serialLine;

static void processSerialLine(String rawLine) {
  rawLine.trim();
  ShimeProtocol::ExpressionResult result = ShimeProtocol::parseExpressionEnvelope(rawLine);
  Serial.println(ShimeProtocol::logForExpressionResult(result));
}

void setup() {
  Serial.begin(115200);
  Serial.println("[SHIME ROBOT SKELETON] boot");
  Serial.println("[SHIME ROBOT SKELETON] No radio credentials are configured in this skeleton.");
  Serial.println("[SHIME ROBOT SKELETON] No network transport is enabled.");
  Serial.println("[SHIME ROBOT SKELETON] No pins, motors, servos, or LEDs are controlled by default.");
  Serial.println("[SHIME SERIAL QA] Paste one expression envelope JSON message per line.");
}

void loop() {
  while (Serial.available() > 0) {
    char next = static_cast<char>(Serial.read());

    if (next == '\r') continue;

    if (next == '\n') {
      processSerialLine(serialLine);
      serialLine = "";
      continue;
    }

    if (serialLine.length() >= MAX_SERIAL_LINE_LENGTH) {
      serialLine = "";
      ShimeProtocol::ExpressionResult result = ShimeProtocol::parseExpressionEnvelope("{\"protocol\":\"shime_robot_expression\",\"protocolVersion\":\"1.0.0\",\"source\":\"shime_quiz\",\"target\":\"shime_robot\",\"messageType\":\"expression_preview\",\"expressionFamily\":\"neutral_presence\",\"allowedChannels\":[\"display_expression\"],\"displayExpression\":\"none\",\"ledPattern\":\"none\",\"soundCue\":\"none\",\"motionPolicy\":\"locked\",\"intensityBucket\":\"low\",\"safetyStatus\":\"allowed_dry_run\",\"privacyStatus\":\"redacted_coarse_only\",\"dryRunOnly\":true,\"sendStatus\":\"not_sent\",\"reasonCodes\":[\"line_too_long\"]}");
      result.accepted = false;
      result.rejectedReason = "payload_too_large";
      result.safetyStatus = "blocked";
      result.privacyStatus = "blocked";
      result.reasonCodes = "\"firmware_expression_rejected\",\"payload_too_large\"";
      Serial.println(ShimeProtocol::logForExpressionResult(result));
      continue;
    }

    serialLine += next;
  }
}
