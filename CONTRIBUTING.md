# Contributing to RD CampusDex

First off, thank you for considering contributing to RD CampusDex! It's people like you that make RD CampusDex such a great platform.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) first. If it's not there, feel free to open a new one.

## 2. Fork & create a branch

If this is something you think you can fix, then fork RD CampusDex and create a branch with a descriptive name.

## 3. Get the test suite running

Make sure you have Node.js and npm installed. Run `npm install` to install dependencies and `npm run dev` to start the local development server. Ensure all tests pass.

## 4. Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first.

## 5. Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with RD CampusDex's master branch:

```sh
git remote add upstream git@github.com:USERNAME/rd-campusdex.git
git fetch upstream
git rebase upstream/master
```

Then push your changes and open a Pull Request. We'll review your code and merge it!

## 6. Code Style Guidelines

- We use **TypeScript** strictly.
- Ensure Prettier formatting is applied.
- Components should use TailwindCSS for styling unless highly custom logic is required.

Thank you for contributing!
