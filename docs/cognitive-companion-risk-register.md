# Cognitive Companion Risk Register

| Risk | Severity | Likelihood | Mitigation | Current Status | Future Blocker |
| --- | --- | --- | --- | --- | --- |
| Privacy leakage | High | Medium | Recursive forbidden-key rejection and valid fixture scans | Controlled | Any raw content in context |
| Over-personalization | Medium | Medium | Coarse buckets only | Controlled | Identity or private settings usage |
| Robotic overreaction | High | Medium | Motion disabled and rate limiting | Controlled | Motion without reviewed governor |
| Frustration misclassification | Medium | Medium | Use coarse hints and calm responses | Open | Treating inference as fact |
| Child/student safety | High | Medium | Child safe mode default | Controlled | High-intensity behavior by default |
| External robot credential risk | High | Medium | Read-only audit, no copying | Controlled | Importing `credentials.h` |
| Robot motion risk | High | Medium | No motion output, expression-only | Controlled | Servo/motor enablement |
| False presence detection | Medium | Medium | Confidence buckets and neutral fallback | Open | Acting on low confidence |
| Wi-Fi/RF inference risk | Medium | Medium | Coarse presence only | Open | Raw RF data sent to app |
| Cloud AI future risk | High | Low now | Future opt-in only | Deferred | Default cloud calls |
| Prompt leakage future risk | High | Medium | AI boundary forbids raw content | Controlled | LLM receives quiz content |
| App complexity risk | Medium | Medium | Keep kernel isolated until simulation | Controlled | Direct StudyRoom coupling |
| AI-like confusion | Medium | Medium | UI copy must say deterministic/local | Open | Marketing claims real AI |
