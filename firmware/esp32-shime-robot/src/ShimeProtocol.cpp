#include "ShimeProtocol.h"

namespace ShimeProtocol {

static const char* ALLOWED_EVENTS[] = {
  "session_started",
  "question_presented",
  "answer_correct",
  "answer_wrong",
  "review_due",
  "session_complete",
  "bridge_error"
};

static const char* ALLOWED_COMMANDS[] = {
  "celebrate",
  "encourage",
  "neutral",
  "focus",
  "session_complete",
  "due_review",
  "error_signal"
};

static const char* ALLOWED_EXPRESSION_FAMILIES[] = {
  "neutral_presence",
  "focus_ritual",
  "review_due_nudge",
  "memory_risk_nudge",
  "gentle_encourage",
  "recovery_praise",
  "celebrate_stability_gain",
  "celebrate_session_complete",
  "suggest_break_soft",
  "reconnect_hint",
  "calm_error",
  "do_nothing"
};

static const char* ALLOWED_EXPRESSION_CHANNELS[] = {
  "display_expression",
  "led_expression",
  "sound_cue",
  "idle_presence",
  "attention_hint",
  "no_op"
};

static const char* REQUIRED_EXPRESSION_KEYS[] = {
  "protocol",
  "protocolVersion",
  "source",
  "target",
  "messageType",
  "expressionFamily",
  "allowedChannels",
  "displayExpression",
  "ledPattern",
  "soundCue",
  "motionPolicy",
  "intensityBucket",
  "safetyStatus",
  "privacyStatus",
  "dryRunOnly",
  "sendStatus",
  "reasonCodes"
};

static const char* FORBIDDEN_KEYS[] = {
  "prompt",
  "question",
  "answer",
  "correctAnswer",
  "explanation",
  "userAnswer",
  "sourceMetadata",
  "settings",
  "studyHistory",
  "backupPayload",
  "importedDocumentText",
  "libraryItemContent",
  "rawQuizPayload"
};

static const char* FORBIDDEN_EXPRESSION_KEYS[] = {
  "prompt",
  "question",
  "answer",
  "correctAnswer",
  "explanation",
  "userAnswer",
  "sourceMetadata",
  "settings",
  "studyHistory",
  "backupPayload",
  "importedDocumentText",
  "libraryItemContent",
  "rawQuizPayload",
  "cameraFrames",
  "audioRecording",
  "biometricIdentity",
  "ssid",
  "password",
  "token",
  "secret",
  "apiKey",
  "credential",
  "auth",
  "bearer",
  "ip",
  "endpoint",
  "url",
  "motor",
  "servo",
  "wheel",
  "drive",
  "pin",
  "pwm",
  "digitalWrite",
  "analogWrite",
  "ledcWrite",
  "motionUnlocked",
  "move",
  "navigate",
  "scheduleMutation",
  "calendarMutation",
  "notificationSend",
  "robotCommandSend",
  "connect",
  "websocket",
  "bluetooth",
  "wifi"
};

static const char* FORBIDDEN_EXPRESSION_CHANNELS[] = {
  "motor_motion",
  "wheel_motion",
  "servo_motion",
  "physical_push",
  "autonomous_navigation",
  "camera_capture",
  "microphone_capture",
  "raw_data_display",
  "speech_from_raw_content",
  "schedule_mutation",
  "notification_send",
  "robot_command_send"
};

static bool isJsonWhitespace(char value) {
  return value == ' ' || value == '\n' || value == '\r' || value == '\t';
}

static bool containsJsonPropertyName(const String& rawJson, const char* key) {
  String pattern = String("\"") + key + "\"";
  int start = rawJson.indexOf(pattern);

  while (start >= 0) {
    int cursor = start + pattern.length();
    while (cursor < rawJson.length() && isJsonWhitespace(rawJson.charAt(cursor))) {
      cursor += 1;
    }

    if (cursor < rawJson.length() && rawJson.charAt(cursor) == ':') {
      return true;
    }

    start = rawJson.indexOf(pattern, start + 1);
  }

  return false;
}

static String extractStringValue(const String& rawJson, const char* key) {
  String pattern = String("\"") + key + "\"";
  int start = rawJson.indexOf(pattern);
  if (start < 0) return "";
  int colon = rawJson.indexOf(':', start + pattern.length());
  if (colon < 0) return "";
  start = rawJson.indexOf('"', colon + 1);
  if (start < 0) return "";
  int end = rawJson.indexOf('"', start + 1);
  if (end < 0) return "";
  return rawJson.substring(start + 1, end);
}

static bool extractBooleanValue(const String& rawJson, const char* key, bool* value) {
  String pattern = String("\"") + key + "\"";
  int start = rawJson.indexOf(pattern);
  if (start < 0) return false;
  int colon = rawJson.indexOf(':', start + pattern.length());
  if (colon < 0) return false;
  int cursor = colon + 1;
  while (cursor < rawJson.length() && isJsonWhitespace(rawJson.charAt(cursor))) {
    cursor += 1;
  }
  if (rawJson.substring(cursor, cursor + 4) == "true") {
    *value = true;
    return true;
  }
  if (rawJson.substring(cursor, cursor + 5) == "false") {
    *value = false;
    return true;
  }
  return false;
}

static bool arrayContainsStringValue(const String& rawJson, const char* key, const String& value) {
  String pattern = String("\"") + key + "\"";
  int start = rawJson.indexOf(pattern);
  if (start < 0) return false;
  int colon = rawJson.indexOf(':', start + pattern.length());
  if (colon < 0) return false;
  int open = rawJson.indexOf('[', colon + 1);
  if (open < 0) return false;
  int close = rawJson.indexOf(']', open + 1);
  if (close < 0) return false;
  String body = rawJson.substring(open + 1, close);
  return body.indexOf(String("\"") + value + "\"") >= 0;
}

static bool hasArrayField(const String& rawJson, const char* key) {
  String pattern = String("\"") + key + "\"";
  int start = rawJson.indexOf(pattern);
  if (start < 0) return false;
  int colon = rawJson.indexOf(':', start + pattern.length());
  if (colon < 0) return false;
  int cursor = colon + 1;
  while (cursor < rawJson.length() && isJsonWhitespace(rawJson.charAt(cursor))) {
    cursor += 1;
  }
  return cursor < rawJson.length() && rawJson.charAt(cursor) == '[';
}

static bool hasNonEmptyArrayField(const String& rawJson, const char* key) {
  String pattern = String("\"") + key + "\"";
  int start = rawJson.indexOf(pattern);
  if (start < 0) return false;
  int colon = rawJson.indexOf(':', start + pattern.length());
  if (colon < 0) return false;
  int open = rawJson.indexOf('[', colon + 1);
  if (open < 0) return false;
  int close = rawJson.indexOf(']', open + 1);
  if (close < 0) return false;
  String body = rawJson.substring(open + 1, close);
  body.trim();
  return body.length() > 0;
}

static bool containsMultipleJsonObjects(const String& rawJson) {
  int depth = 0;
  bool inString = false;
  bool escaped = false;
  bool closedTopLevel = false;
  for (int i = 0; i < rawJson.length(); i += 1) {
    char current = rawJson.charAt(i);
    if (escaped) {
      escaped = false;
      continue;
    }
    if (current == '\\' && inString) {
      escaped = true;
      continue;
    }
    if (current == '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (current == '{') {
      if (closedTopLevel) return true;
      depth += 1;
    } else if (current == '}') {
      depth -= 1;
      if (depth == 0) closedTopLevel = true;
      if (depth < 0) return true;
    } else if (closedTopLevel && !isJsonWhitespace(current)) {
      return true;
    }
  }
  return false;
}

static bool looksLikeJsonObject(const String& rawJson) {
  String trimmed = rawJson;
  trimmed.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}") && !containsMultipleJsonObjects(trimmed);
}

bool containsForbiddenSensitiveKey(const String& rawJson) {
  for (const char* key : FORBIDDEN_KEYS) {
    if (containsJsonPropertyName(rawJson, key)) return true;
  }
  return false;
}

bool containsForbiddenExpressionKey(const String& rawJson) {
  for (const char* key : FORBIDDEN_EXPRESSION_KEYS) {
    if (containsJsonPropertyName(rawJson, key)) return true;
  }
  return false;
}

bool isAllowedEventName(const String& eventName) {
  for (const char* allowed : ALLOWED_EVENTS) {
    if (eventName == allowed) return true;
  }
  return false;
}

bool isAllowedCommandName(const String& commandName) {
  for (const char* allowed : ALLOWED_COMMANDS) {
    if (commandName == allowed) return true;
  }
  return false;
}

bool isAllowedExpressionFamily(const String& expressionFamily) {
  for (const char* allowed : ALLOWED_EXPRESSION_FAMILIES) {
    if (expressionFamily == allowed) return true;
  }
  return false;
}

bool isAllowedExpressionChannel(const String& channel) {
  for (const char* allowed : ALLOWED_EXPRESSION_CHANNELS) {
    if (channel == allowed) return true;
  }
  return false;
}

MessageKind classifyMessageType(const String& rawJson) {
  String messageType = extractStringValue(rawJson, "messageType");
  if (messageType == "expression_preview") return MessageKind::ExpressionPreview;
  if (messageType == "hello") return MessageKind::Hello;
  if (messageType == "robot_event") return MessageKind::RobotEvent;
  if (messageType == "robot_command") return MessageKind::RobotCommand;
  if (messageType == "ping") return MessageKind::Ping;
  if (messageType == "disconnect") return MessageKind::Disconnect;
  return MessageKind::Unknown;
}

static ExpressionResult rejectedExpression(const String& reason) {
  ExpressionResult result;
  result.accepted = false;
  result.rejectedReason = reason;
  result.protocolVersion = EXPRESSION_PROTOCOL_VERSION;
  result.expressionFamily = "";
  result.displayExpression = "";
  result.ledPattern = "";
  result.soundCue = "";
  result.motionPolicy = "locked";
  result.dryRunOnly = true;
  result.sendStatus = "not_sent";
  result.safetyStatus = "blocked";
  result.privacyStatus = "blocked";
  result.reasonCodes = String("\"firmware_expression_rejected\",\"") + reason + "\"";
  return result;
}

static bool anyForbiddenChannelPresent(const String& rawJson) {
  for (const char* channel : FORBIDDEN_EXPRESSION_CHANNELS) {
    if (arrayContainsStringValue(rawJson, "allowedChannels", channel)) return true;
  }
  return false;
}

static bool anyAllowedChannelPresent(const String& rawJson) {
  for (const char* channel : ALLOWED_EXPRESSION_CHANNELS) {
    if (arrayContainsStringValue(rawJson, "allowedChannels", channel)) return true;
  }
  return false;
}

ExpressionResult parseExpressionEnvelope(const String& rawJson) {
  String trimmed = rawJson;
  trimmed.trim();

  if (trimmed.length() == 0) return rejectedExpression("empty_line");
  if (trimmed.length() > MAX_EXPRESSION_LINE_LENGTH) return rejectedExpression("payload_too_large");
  if (!looksLikeJsonObject(trimmed)) return rejectedExpression("malformed_json");
  if (containsForbiddenExpressionKey(trimmed)) return rejectedExpression("forbidden_key_detected");

  for (const char* key : REQUIRED_EXPRESSION_KEYS) {
    if (!containsJsonPropertyName(trimmed, key)) {
      return rejectedExpression(String("missing_field_") + key);
    }
  }

  if (extractStringValue(trimmed, "protocol") != "shime_robot_expression") return rejectedExpression("unsupported_protocol");
  if (extractStringValue(trimmed, "protocolVersion") != EXPRESSION_PROTOCOL_VERSION) return rejectedExpression("unsupported_protocol_version");
  if (extractStringValue(trimmed, "source") != "shime_quiz") return rejectedExpression("unsupported_source");
  if (extractStringValue(trimmed, "target") != "shime_robot") return rejectedExpression("unsupported_target");
  if (extractStringValue(trimmed, "messageType") != "expression_preview") return rejectedExpression("unknown_message_type");

  String expressionFamily = extractStringValue(trimmed, "expressionFamily");
  if (!isAllowedExpressionFamily(expressionFamily)) return rejectedExpression("unknown_expression_family");

  if (!hasArrayField(trimmed, "allowedChannels")) return rejectedExpression("allowed_channels_not_array");
  if (anyForbiddenChannelPresent(trimmed)) return rejectedExpression("forbidden_channel");
  if (!anyAllowedChannelPresent(trimmed)) return rejectedExpression("unknown_channel");

  if (extractStringValue(trimmed, "motionPolicy") != "locked") return rejectedExpression("motion_not_locked");
  bool dryRunOnly = false;
  if (!extractBooleanValue(trimmed, "dryRunOnly", &dryRunOnly) || !dryRunOnly) return rejectedExpression("not_dry_run");
  if (extractStringValue(trimmed, "sendStatus") != "not_sent") return rejectedExpression("send_status_not_safe");
  if (!hasNonEmptyArrayField(trimmed, "reasonCodes")) return rejectedExpression("missing_reason_codes");
  if (extractStringValue(trimmed, "privacyStatus") != "redacted_coarse_only") return rejectedExpression("privacy_status_not_safe");
  if (extractStringValue(trimmed, "safetyStatus") != "allowed_dry_run") return rejectedExpression("safety_status_not_safe");

  ExpressionResult result;
  result.accepted = true;
  result.rejectedReason = "none";
  result.protocolVersion = EXPRESSION_PROTOCOL_VERSION;
  result.expressionFamily = expressionFamily;
  result.displayExpression = extractStringValue(trimmed, "displayExpression");
  result.ledPattern = extractStringValue(trimmed, "ledPattern");
  result.soundCue = extractStringValue(trimmed, "soundCue");
  result.motionPolicy = "locked";
  result.dryRunOnly = true;
  result.sendStatus = "not_sent";
  result.safetyStatus = "allowed_dry_run";
  result.privacyStatus = "redacted_coarse_only";
  result.reasonCodes = "\"firmware_expression_accepted\"";
  return result;
}

String logForExpressionResult(const ExpressionResult& result) {
  String base = String("{\"logProtocol\":\"shime_esp32_expression_log\",\"protocolVersion\":\"") +
    EXPRESSION_PROTOCOL_VERSION + "\",\"accepted\":";
  if (!result.accepted) {
    return base + "false,\"rejectedReason\":\"" + result.rejectedReason +
      "\",\"motionPolicy\":\"locked\",\"dryRunOnly\":true,\"sendStatus\":\"not_sent\",\"reasonCodes\":[" +
      result.reasonCodes + "]}";
  }
  return base + "true,\"expressionFamily\":\"" + result.expressionFamily +
    "\",\"displayExpression\":\"" + result.displayExpression +
    "\",\"ledPattern\":\"" + result.ledPattern +
    "\",\"soundCue\":\"" + result.soundCue +
    "\",\"motionPolicy\":\"locked\",\"dryRunOnly\":true,\"sendStatus\":\"not_sent\",\"safetyStatus\":\"" +
    result.safetyStatus + "\",\"privacyStatus\":\"" + result.privacyStatus +
    "\",\"reasonCodes\":[" + result.reasonCodes + "]}";
}

ProtocolResult parseIncomingMessage(const String& rawJson) {
  ProtocolResult result;
  result.status = ProtocolStatus::Rejected;
  result.kind = classifyMessageType(rawJson);
  result.reason = "invalid_message";
  result.messageId = extractStringValue(rawJson, "messageId");
  result.eventName = extractStringValue(rawJson, "eventType");
  result.commandName = extractStringValue(rawJson, "command");

  if (!looksLikeJsonObject(rawJson)) {
    result.reason = "malformed_message";
    return result;
  }

  if (rawJson.indexOf(PROTOCOL_VERSION) < 0) {
    result.reason = "invalid_protocol_version";
    return result;
  }

  if (containsForbiddenSensitiveKey(rawJson)) {
    result.reason = "sensitive_payload_detected";
    return result;
  }

  if (result.kind == MessageKind::Unknown) {
    result.reason = "unknown_message_type";
    return result;
  }

  if (result.kind == MessageKind::RobotEvent && !isAllowedEventName(result.eventName)) {
    result.reason = "unknown_event";
    return result;
  }

  if (result.kind == MessageKind::RobotCommand && !isAllowedCommandName(result.commandName)) {
    result.reason = "unknown_command";
    return result;
  }

  result.status = ProtocolStatus::Accepted;
  result.reason = "accepted";
  return result;
}

String responseForResult(const ProtocolResult& result) {
  String messageId = result.messageId.length() > 0 ? String("esp32_response_to_") + result.messageId : "esp32_response";
  String emittedAt = "1970-01-01T00:00:00.000Z";

  if (result.status == ProtocolStatus::Rejected) {
    return String("{\"protocolVersion\":\"") + PROTOCOL_VERSION +
      "\",\"messageId\":\"" + messageId +
      "\",\"messageType\":\"error\",\"emittedAt\":\"" + emittedAt +
      "\",\"source\":\"shime-esp32-skeleton\",\"payload\":{\"reasonCode\":\"" +
      result.reason + "\",\"message\":\"message_rejected\"}}";
  }

  if (result.kind == MessageKind::Hello) {
    return String("{\"protocolVersion\":\"") + PROTOCOL_VERSION +
      "\",\"messageId\":\"" + messageId +
      "\",\"messageType\":\"hello_ack\",\"emittedAt\":\"" + emittedAt +
      "\",\"source\":\"shime-esp32-skeleton\",\"payload\":{\"transportStatus\":\"connected\",\"message\":\"protocol_ready\"}}";
  }

  if (result.kind == MessageKind::Ping) {
    return String("{\"protocolVersion\":\"") + PROTOCOL_VERSION +
      "\",\"messageId\":\"" + messageId +
      "\",\"messageType\":\"pong\",\"emittedAt\":\"" + emittedAt +
      "\",\"source\":\"shime-esp32-skeleton\",\"payload\":{\"transportStatus\":\"connected\",\"message\":\"pong\"}}";
  }

  return String("{\"protocolVersion\":\"") + PROTOCOL_VERSION +
    "\",\"messageId\":\"" + messageId +
    "\",\"messageType\":\"ack\",\"emittedAt\":\"" + emittedAt +
    "\",\"source\":\"shime-esp32-skeleton\",\"payload\":{\"transportStatus\":\"connected\",\"message\":\"message_acknowledged\"}}";
}

}  // namespace ShimeProtocol
