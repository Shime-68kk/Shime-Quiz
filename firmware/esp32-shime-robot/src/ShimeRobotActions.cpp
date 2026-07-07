#include "ShimeRobotActions.h"

namespace ShimeRobotActions {

static void logAction(const char* action) {
  Serial.print("[SHIME ROBOT SKELETON] action stub: ");
  Serial.println(action);
}

void celebrate() {
  logAction("celebrate");
}

void encourage() {
  logAction("encourage");
}

void neutral() {
  logAction("neutral");
}

void focus() {
  logAction("focus");
}

void sessionComplete() {
  logAction("session_complete");
}

void dueReview() {
  logAction("due_review");
}

void errorSignal() {
  logAction("error_signal");
}

void applyEvent(const String& eventName) {
  if (eventName == "session_started") return neutral();
  if (eventName == "question_presented") return focus();
  if (eventName == "answer_correct") return celebrate();
  if (eventName == "answer_wrong") return encourage();
  if (eventName == "review_due") return dueReview();
  if (eventName == "session_complete") return sessionComplete();
  if (eventName == "bridge_error") return errorSignal();
  neutral();
}

void applyCommand(const String& commandName) {
  if (commandName == "celebrate") return celebrate();
  if (commandName == "encourage") return encourage();
  if (commandName == "focus") return focus();
  if (commandName == "session_complete") return sessionComplete();
  if (commandName == "due_review") return dueReview();
  if (commandName == "error_signal") return errorSignal();
  neutral();
}

}  // namespace ShimeRobotActions

