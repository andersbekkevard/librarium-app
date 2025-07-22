When you run npm run dev locally, npm uses a more lenient dependency resolution strategy by default. It often ignores peer
  dependency warnings and allows packages with mismatched peer dependencies to be installed and used.

  However, Vercel's build environment is stricter and treats peer dependency conflicts as hard errors, causing the build to fail.

  Your local development works because:
  1. npm likely installed with --legacy-peer-deps behavior automatically
  2. React 19 is mostly backward compatible with React 18 APIs that react-zxing uses
  3. Local builds are more forgiving of peer dependency mismatches

  For Vercel deployment, you can add this to your package.json:

  "engines": {
    "npm": ">=8.0.0"
  },
  ".npmrc": "legacy-peer-deps=true"

  Or create a .npmrc file in your project root with:
  legacy-peer-deps=true

  This will make Vercel's build process behave more like your local development environment.