---
"apollo-state-sync": minor
---

synced reactive variable was checking on truthiness of the first parameter to switch to getter behavious. It is now fixed to check on arguments length.
