---
"apollo-state-sync": patch
---

fix(global-config): rename misspelled synchronizationDebounceTimeoutMs field

Renames `synhnorizationDebounceTimeoutMs` to `synchronizationDebounceTimeoutMs`.

The original misspelled field is now deprecated and will be removed in 
the next major release. It remains active for backward compatibility.