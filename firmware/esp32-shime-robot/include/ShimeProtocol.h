#pragma once

#include <Arduino.h>

namespace ShimeProtocol {

static const char* PROTOCOL_VERSION = "shime-ws-robot-v0";
static const char* EXPRESSION_PROTOCOL_VERSION = "1.0.0";
static const size_t MAX_EXPRESSION_LINE_LENGTH = 2048;

enum class MessageKind {
  Hello,
  RobotEvent,
  RobotCommand,
  Ping,
  Disconnect,
  ExpressionPreview,
  Unknown
};

enum class ProtocolStatus {
  Accepted,
  Rejected
};

struct ProtocolResult {
  ProtocolStatus status;
  MessageKind kind;
  String reason;
  String messageId;
  String eventName;
  String commandName;
};

struct ExpressionResult {
  bool accepted;
  String rejectedReason;
  String protocolVersion;
  String expressionFamily;
  String displayExpression;
  String ledPattern;
  String soundCue;
  String motionPolicy;
  bool dryRunOnly;
  String sendStatus;
  String safetyStatus;
  String privacyStatus;
  String reasonCodes;
};

bool containsForbiddenSensitiveKey(const String& rawJson);
bool containsForbiddenExpressionKey(const String& rawJson);
bool isAllowedEventName(const String& eventName);
bool isAllowedCommandName(const String& commandName);
bool isAllowedExpressionFamily(const String& expressionFamily);
bool isAllowedExpressionChannel(const String& channel);
MessageKind classifyMessageType(const String& rawJson);
ProtocolResult parseIncomingMessage(const String& rawJson);
String responseForResult(const ProtocolResult& result);
ExpressionResult parseExpressionEnvelope(const String& rawJson);
String logForExpressionResult(const ExpressionResult& result);

}  // namespace ShimeProtocol
