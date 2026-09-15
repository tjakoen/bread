# Bun plus a real Chromium, for the one gate that needs a browser.
#
# grain's mermaid renderer drives Playwright, so packages/mill/diagrams/mermaid-playwright.test.ts
# fails on oven/bun:slim with "Executable doesn't exist at .../chrome-headless-shell". That is an
# image gap rather than a defect, and it is the only reason this file exists: every other gate in
# compose.yml runs on the stock bun image and should stay there.
#
# The base is Playwright's own image because it already carries the browsers and the system
# libraries they need. Installing those with `playwright install --with-deps` at run time would
# re-download them on every gate run, since a container layer does not survive the run and apt
# packages cannot live in the node_modules volume.
# THE TAG MUST MATCH THE PLAYWRIGHT VERSION GRAIN RESOLVES, not merely be recent. The browser build
# is keyed to the driver, so a mismatch fails with "Executable doesn't exist at
# .../chromium_headless_shell-<build>" and Playwright prints the exact tag it wants. Read that line
# rather than guessing when grain's dependency moves.
FROM mcr.microsoft.com/playwright:v1.61.1-noble

# Bun is not in the Playwright image. The official installer puts it at ~/.bun/bin.
ENV BUN_INSTALL=/usr/local
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl unzip ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && curl -fsSL https://bun.sh/install | bash -s "bun-v1.4.2" \
 && bun --version

WORKDIR /app
