#pragma once

#include <Arduino.h>

namespace ShimeRobotActions {

void celebrate();
void encourage();
void neutral();
void focus();
void sessionComplete();
void dueReview();
void errorSignal();
void applyEvent(const String& eventName);
void applyCommand(const String& commandName);

}  // namespace ShimeRobotActions

