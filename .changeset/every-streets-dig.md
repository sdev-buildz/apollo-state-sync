---
"apollo-state-sync": patch
---

fix(cache syncer fn): pass the provided arguments to the original reset fn in setupBroadcastorForResets
fix(synced cache): `await` on `super.reset` before syncing in InMemoryCacheSynced.reset