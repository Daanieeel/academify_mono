# Instructions

Proceed with your changes even when there are unstaged/uncommited pre-existing changes. Do not care for changes/files you didn't make.

We are using TypeScript Version 6. This is the prepration for the change to Go in TypeScript Version 7. It handles some things differnetly. Recheck you tsconfigs when making a change.
Common mistake: "baseUrl" is deprecated now. All properties that depend on baseUrl cna now be written as follows: "xyz": "./src/**" instead of "baseUrl": "./", "xyz": "src/**"

<!-- BEGIN:nextjs-agent-rules -->

-> **This is NOT the Next.js you know**

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

Always use bun, not npm

Pages (Next.js and Expo) must always be function components.

Always use bun instead of npm, pnpm or yarn.

## TypeScript Coding Standards

- You MUST always use strict typing. Avoid the any type at all times.
- You MUST always enable and respect the strict mode in the tsconfig.json file.
- You MUST always prefer type aliases or interfaces over inline object types for better readability and reusability.
- You MUST always use readonly for properties that should not be modified after initialization.
- You MUST always use strict null checks.
- You MUST always prefer interface over type when possible.
- You MUST always utilize type guards and assertions for runtime type checking.
- You MUST always implement proper type inference to reduce explicit type annotations.
- You MUST always use nullish coalescing operator (??) instead of a logical or (||), as it is a safer operator.
- You SHOULD NEVER use non-null assertions (!) unless you are certain the value cannot be null or undefined.

### Best Practices for TypeScript Features

#### Union and Intersection Types

- You MUST use union types (|) to represent a value that can be one of several types.
- You SHOULD use intersection types (&) sparingly and only when combining multiple types is necessary.

#### Enums

- You SHOULD prefer using string literal unions over enums unless enums are required for specific use cases.

#### Generics

- You MUST use generics to create reusable components or functions when working with collections or dynamic data structures.
- You SHOULD ALWAYS provide meaningful names for generic type parameters (e.g., TItem instead of just T).
