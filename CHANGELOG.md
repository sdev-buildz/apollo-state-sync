# apollo-state-sync

## 1.1.1

### Patch Changes

- [#79](https://github.com/sdev-buildz/apollo-state-sync/pull/79) [`6f65d3a`](https://github.com/sdev-buildz/apollo-state-sync/commit/6f65d3a9c459112e653cbfe2897279cda6e30fc4) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - fix(makeVarSynced): When comparing new and previous values, use previous value instead of inital value.

- [#79](https://github.com/sdev-buildz/apollo-state-sync/pull/79) [`6f65d3a`](https://github.com/sdev-buildz/apollo-state-sync/commit/6f65d3a9c459112e653cbfe2897279cda6e30fc4) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - fix(cache syncer fn): pass the provided arguments to the original reset fn in setupBroadcastorForResets
  fix(synced cache): `await` on `super.reset` before syncing in InMemoryCacheSynced.reset

- [#79](https://github.com/sdev-buildz/apollo-state-sync/pull/79) [`6f65d3a`](https://github.com/sdev-buildz/apollo-state-sync/commit/6f65d3a9c459112e653cbfe2897279cda6e30fc4) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - fix(stateSyncLink): notify syncDebouncer when subscriber unsubscribes

- [#74](https://github.com/sdev-buildz/apollo-state-sync/pull/74) [`dbba64f`](https://github.com/sdev-buildz/apollo-state-sync/commit/dbba64f14444538c934c8f189f6d2f010e7bb7a0) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - fix and improve readme and typedoc comments. Improve descriptions in migration util's --help output.

- [#79](https://github.com/sdev-buildz/apollo-state-sync/pull/79) [`6f65d3a`](https://github.com/sdev-buildz/apollo-state-sync/commit/6f65d3a9c459112e653cbfe2897279cda6e30fc4) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - fix(migration): accept tsconfig.json path provided as positional argument. tsconfig.json path should default to './tsconfig.json'.

- [#70](https://github.com/sdev-buildz/apollo-state-sync/pull/70) [`2caa89b`](https://github.com/sdev-buildz/apollo-state-sync/commit/2caa89be1be74f7f40381a829f05fa7a698491cb) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - fix(global-config): rename misspelled synchronizationDebounceTimeoutMs field

  Renames `synhnorizationDebounceTimeoutMs` to `synchronizationDebounceTimeoutMs`.

  The original misspelled field is now deprecated and will be removed in
  the next major release. It remains active for backward compatibility.

- Updated dependencies [[`dbba64f`](https://github.com/sdev-buildz/apollo-state-sync/commit/dbba64f14444538c934c8f189f6d2f010e7bb7a0), [`6f65d3a`](https://github.com/sdev-buildz/apollo-state-sync/commit/6f65d3a9c459112e653cbfe2897279cda6e30fc4)]:
  - apollo-shared-ws@1.0.2

## 1.1.0

### Minor Changes

- [#54](https://github.com/sdev-buildz/apollo-state-sync/pull/54) [`17c71e2`](https://github.com/sdev-buildz/apollo-state-sync/commit/17c71e275982f36f63b111d734d62059da65506d) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - shortened the name of function which creates synced reactive variables. Renamed from makeVarStateSynced to makeVarSynced

### Patch Changes

- [#54](https://github.com/sdev-buildz/apollo-state-sync/pull/54) [`17c71e2`](https://github.com/sdev-buildz/apollo-state-sync/commit/17c71e275982f36f63b111d734d62059da65506d) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - Improved typedoc comments.

- [#54](https://github.com/sdev-buildz/apollo-state-sync/pull/54) [`213ccff`](https://github.com/sdev-buildz/apollo-state-sync/commit/213ccffb312948d154299cfd9cb954bfbd70e456) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - added API_OVERVIEW.md for quick start.
  Added more typedoc.config externalSymbolLinkMappings.

- [#48](https://github.com/sdev-buildz/apollo-state-sync/pull/48) [`e22f517`](https://github.com/sdev-buildz/apollo-state-sync/commit/e22f517976e38b366dbe664e1142d250069e1760) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - dependency versions updated.

- [#54](https://github.com/sdev-buildz/apollo-state-sync/pull/54) [`17c71e2`](https://github.com/sdev-buildz/apollo-state-sync/commit/17c71e275982f36f63b111d734d62059da65506d) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - exported typescript types. This includes them in generated typedoc docs.
- Updated dependencies [[`17c71e2`](https://github.com/sdev-buildz/apollo-state-sync/commit/17c71e275982f36f63b111d734d62059da65506d)]:
  - apollo-shared-ws@1.0.1

## 1.0.0

### Major Changes

- [#41](https://github.com/sdev-buildz/apollo-state-sync/pull/41) [`1a7f780`](https://github.com/sdev-buildz/apollo-state-sync/commit/1a7f780c6dd02439b6ef836f45f13f609bee6179) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - First stable release.

### Patch Changes

- Updated dependencies [[`1a7f780`](https://github.com/sdev-buildz/apollo-state-sync/commit/1a7f780c6dd02439b6ef836f45f13f609bee6179), [`9995dbe`](https://github.com/sdev-buildz/apollo-state-sync/commit/9995dbe8b8df9d6bba1cbb9d0ee400e19c175010)]:
  - apollo-shared-ws@1.0.0

## 0.1.1

### Patch Changes

- [#39](https://github.com/sdev-buildz/apollo-state-sync/pull/39) [`d203c82`](https://github.com/sdev-buildz/apollo-state-sync/commit/d203c82f470d0ce65416ef339250b79e7a214f91) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - In `apollo-state-sync` README.md, added API documentation link. ts-morph is installed with --save-dev instead of -g to support node module resolution of npx. added more details to `Architecture` section of `apollo-shared-ws` README.md.
- Updated dependencies [[`d203c82`](https://github.com/sdev-buildz/apollo-state-sync/commit/d203c82f470d0ce65416ef339250b79e7a214f91)]:
  - apollo-shared-ws@0.0.3

## 0.1.0

### Minor Changes

- [#36](https://github.com/sdev-buildz/apollo-state-sync/pull/36) [`1008301`](https://github.com/sdev-buildz/apollo-state-sync/commit/10083016af81f95ee732e8ae8f6db62487da3e46) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - synced reactive variable was checking on truthiness of the first parameter to switch to getter behavious. It is now fixed to check on arguments length.

## 0.0.2

### Patch Changes

- [#34](https://github.com/sdev-buildz/apollo-state-sync/pull/34) [`e9215f0`](https://github.com/sdev-buildz/apollo-state-sync/commit/e9215f0411d77115b2069367df7bef857597797b) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - readme docs improved.
- Updated dependencies [[`e9215f0`](https://github.com/sdev-buildz/apollo-state-sync/commit/e9215f0411d77115b2069367df7bef857597797b)]:
  - apollo-shared-ws@0.0.2

## 0.0.1

### Patch Changes

- [#30](https://github.com/sdev-buildz/apollo-state-sync/pull/30) [`3103db5`](https://github.com/sdev-buildz/apollo-state-sync/commit/3103db5a091da84f7369e5c2a182228d2f30d2b0) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - Peer dependency 'apollo-shared-ws' is made optional for 'apollo-state-sync'.

- [#30](https://github.com/sdev-buildz/apollo-state-sync/pull/30) [`7dce7e4`](https://github.com/sdev-buildz/apollo-state-sync/commit/7dce7e40371504ae01a71722a71f5201d6f07f58) Thanks [@sdev-buildz](https://github.com/sdev-buildz)! - Improved readme files. Improved typedoc comments of 'apollo-shared-ws'.
- Updated dependencies [[`7dce7e4`](https://github.com/sdev-buildz/apollo-state-sync/commit/7dce7e40371504ae01a71722a71f5201d6f07f58)]:
  - apollo-shared-ws@0.0.1
