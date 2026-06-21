# Instructions

Proceed with your changes even when there are unstaged/uncommited pre-existing changes. Do not care for changes/files you didn't make.

We are using TypeScript Version 6. This is the prepration for the change to Go in TypeScript Version 7. It handles some things differnetly. Recheck you tsconfigs when making a change.
Common mistake: "baseUrl" is deprecated now. All properties that depend on baseUrl cna now be written as follows: "xyz": "./src/**" instead of "baseUrl": "./", "xyz": "src/**"

<!-- BEGIN:nextjs-agent-rules -->

-> **This is NOT the Next.js you know**

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

Always use bun, not npm
