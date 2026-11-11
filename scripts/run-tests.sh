#!/usr/bin/env bash
# Simulated test runner for the playground. It fails when .ci/fail-tests exists
# or when package.json asks for chalk 5+, which is ESM-only and breaks require().
set -uo pipefail

green=$'\e[32m'; red=$'\e[31m'; dim=$'\e[2m'; bold=$'\e[1m'; reset=$'\e[0m'
pass() { printf '  %s✓%s %s %s(%s ms)%s\n' "$green" "$reset" "$1" "$dim" "$2" "$reset"; }
fail() { printf '  %s✗%s %s %s(%s ms)%s\n' "$red" "$reset" "$1" "$dim" "$2" "$reset"; }

failed=0

echo "::group::pricing"
echo "${bold}src/ts/pricing.test.ts${reset}"
pass "billableWeightKg uses actual weight for dense parcels" 3
pass "billableWeightKg uses volumetric weight for light parcels" 1
pass "quote adds the base rate" 1
echo "::endgroup::"

echo "::group::tracker"
echo "${bold}src/ts/tracker.test.ts${reset}"
pass "register rejects duplicate ids" 2
pass "record appends an event" 1
if [ -f .ci/fail-tests ]; then
  fail "record rejects delivered -> in_transit" 14
  cat <<MSG

  ${red}● Tracker › record rejects delivered -> in_transit${reset}

    expect(received).toThrow(expected)

    Expected constructor: ${green}InvalidTransitionError${reset}
    Received function did not throw

      52 |     const from = currentStatus(shipment);
    > 53 |     if (!ALLOWED[from].includes(status)) {
         |                        ^
      54 |       throw new InvalidTransitionError(from, status);

      at Object.<anonymous> (src/ts/tracker.test.ts:41:38)

MSG
  echo "::error file=src/ts/tracker.ts,line=53,col=24,title=Tracker › record rejects delivered -> in_transit::Expected InvalidTransitionError, but the function did not throw"
  failed=$((failed + 1))
else
  pass "record rejects delivered -> in_transit" 2
fi
pass "countByStatus counts every status" 1
echo "::endgroup::"

echo "::group::format"
echo "${bold}src/ts/format.test.ts${reset}"
chalk_major=$(sed -n 's/.*"chalk": *"[^0-9]*\([0-9]*\)\..*/\1/p' package.json)
if [ "${chalk_major:-0}" -ge 5 ]; then
  fail "formatSummary colors the status" 0
  cat <<MSG

  ${red}● Test suite failed to run${reset}

    Error [ERR_REQUIRE_ESM]: require() of ES Module node_modules/chalk/source/index.js
    from src/ts/format.ts not supported. chalk ${chalk_major}.x is ESM-only.

      at Object.<anonymous> (src/ts/format.ts:2:15)

MSG
  echo "::error file=src/ts/format.ts,line=2,title=ERR_REQUIRE_ESM::chalk ${chalk_major}.x is ESM-only and cannot be loaded with require()"
  echo "::error file=package.json,title=Incompatible dependency::chalk must stay below 5.0.0 until the build moves to ES modules"
  failed=$((failed + 1))
else
  pass "formatEvent prints the note" 1
  pass "formatSummary colors the status" 2
fi
echo "::endgroup::"

echo
if [ "$failed" -gt 0 ]; then
  echo "${red}${bold}Tests: $failed failed${reset}, 8 passed, $((8 + failed)) total"
  exit 1
fi
echo "${green}${bold}Tests: 10 passed${reset}, 10 total"
