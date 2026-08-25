# Contribution Guidelines

Thank you for your interest in contributing to the Concrete Crack Detection project. Contributions — whether code, tests, documentation, issue reports, or examples — make the project stronger and more useful. This document outlines the practices we expect contributors to follow, the types of contributions we welcome, and templates and rules for submitting issues and pull requests.

Overview

We value clear, focused contributions that are well-documented and easy to review. Before submitting changes, search existing issues and pull requests to avoid duplication. For larger changes, open an issue first to discuss design and scope. Keep changes small and scoped to a single purpose (a bug fix, a new feature, a refactor, or documentation improvement) to simplify review and reduce risk.

Types of contributions

- Bug reports: Describe the defect, provide steps to reproduce, and include environment details and error messages.
- Feature requests: Explain the problem the feature solves, the intended users, and any trade-offs.
- Code changes: Fixes, new features, or refactors. Include tests and documentation updates when appropriate.
- Tests: Unit, integration, or dataset validation tests that increase confidence and prevent regressions.
- Documentation: Improvements to README, tutorials, inline code comments, and usage examples.
- Examples and small datasets: Minimal example notebooks, sample images, or small datasets that help reproduce results. Do not include large or proprietary datasets; always ensure appropriate licensing and privacy.
- CI / DevOps: Improvements to continuous integration, automated tests, linters, and release processes.

Before you start

- Search issues and PRs to see if your idea is already discussed or implemented.
- If your change is non-trivial, open an issue describing the proposal and include design notes and alternatives to get early feedback.
- Fork the repository and create a topic branch from the default branch. Use descriptive branch names, e.g., `fix/preprocess-paths`, `feat/augmentation`, or `docs/update-readme`.

Development practices

- Commit messages: Use clear, imperative messages. Start with a short summary (about 50 characters), add a blank line, and include details when necessary.
- Small and focused commits: Make each commit address a single concern. This makes review and bisecting easier.
- Tests: Add or update tests for code changes. Run the test suite locally and ensure tests pass before submitting a PR.
- Formatting and linting: Follow the project’s style. Run formatters and linters (and pre-commit hooks if provided) before committing.
- Security and privacy: Never include secrets, credentials, or private data in commits or examples.
- Licensing: Ensure any third-party code, models, or datasets you include are license-compatible with this project.

Code review process

- Create a pull request (PR) from your topic branch to the repository’s default branch.
- Fill the PR template below and provide a clear description of the change, why it was made, and how to test it.
- Reviewers will comment on the PR. Address feedback promptly with additional commits and keep the conversation constructive.
- Avoid force-pushing to a branch under active review unless requested by maintainers. If you need to rebase, communicate clearly in the PR.

Merging and release rules

- One logical change per PR. If you have unrelated changes, split them into separate PRs.
- Ensure all CI checks pass before requesting a merge. Do not merge your own PR unless you have explicit permission from a maintainer.
- If requested by maintainers, squash or rebase commits to keep the history clean.
- If your PR introduces a breaking change, clearly label it and include migration instructions.

Issue template

When filing an issue, please use the following structure. Copy this into a new issue body to help maintainers triage and reproduce the problem.

---

Title: [brief summary]

Description

Provide a clear and concise description of the problem and why it is a problem. Describe the expected and actual behavior.

Steps to reproduce

1. List the exact steps to reproduce the issue
2. Include commands or code snippets where applicable
3. Attach small sample data or images if they help illustrate the problem

Expected behavior

Describe what you expected to happen.

Actual behavior

Describe what happened instead, including error messages, stack traces, and logs.

Environment

- OS: (e.g., Ubuntu 22.04, Windows 11, macOS 13)
- Python version: (e.g., 3.10)
- Package versions: (e.g., numpy 1.26.1, torch 2.1.0)
- Installation method: (pip, conda, from source)

Additional context

Add any other context (screenshots, small files, links to related issues).

Labels to consider: bug, needs-info, reproducible

---

Feature request template

When proposing a new feature, use the template below to provide context and a suggested approach.

---

Title: [short summary]

Motivation and description

Explain the problem, who benefits, and why the feature is needed.

Proposed solution

Describe the change, suggested APIs, and alternatives considered. If you'd like to implement the feature yourself, outline the high-level implementation plan.

Backward compatibility and migration

Note whether the change is backward-compatible and list any migration steps if necessary.

Examples and mockups

Provide example usage, diagrams, or expected outputs where helpful.

Labels to consider: enhancement, discussion-needed

---

Pull request template and submission rules

Please include the following when opening a PR. Use the checklist to help reviewers.

---

Title: [concise summary]

Description

Provide a short description of the changes and the reasoning. Reference related issues using `Fixes #<issue-number>` or `Closes #<issue-number>` when applicable.

Type of change

- Bug fix (non-breaking change)
- New feature (non-breaking change)
- Breaking change (requires migration)
- Documentation update

Checklist

- [ ] I have read the contribution guidelines in CONTRIBUTION.md
- [ ] My code follows the project’s style guidelines
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] I have added necessary documentation (if appropriate)
- [ ] All new and existing tests pass locally
- [ ] I have run linters/formatters and fixed style issues

How to test

Provide step-by-step instructions to validate the change locally. Include commands and expected outputs where applicable.

Screenshots / evidence

Include screenshots, logs, or test output demonstrating the change if relevant.

Additional notes for reviewers

Highlight any non-obvious changes, performance implications, or API changes. Explain choices and trade-offs where appropriate.

Rules and regulations for submitting pull requests

- Keep each PR focused on a single logical change. Large or mixed-purpose PRs may be closed or asked to be split.
- Do not combine unrelated formatting or whitespace changes with code changes.
- Ensure your branch builds and tests pass before requesting review.
- Keep branches up to date with the base branch. Rebase or merge as requested by maintainers.
- Respond to review comments courteously and promptly. If you disagree, explain your reasoning respectfully.
- Clearly mark breaking changes in the PR title and description and provide migration guidance.

Maintainers and review workflow

Maintainers will triage issues and label PRs. Expect maintainers to request changes or tests if a PR is missing coverage or clarity. If your PR goes stale, politely ping maintainers or ask for guidance in the associated issue or PR.

Code of conduct

All contributors are expected to follow a respectful and professional Code of Conduct. If this repository has a CODE_OF_CONDUCT.md file, please follow it. If not, adhere to common open source etiquette: be respectful, constructive, and patient.

Thank you

Thank you for contributing. Your efforts help make this project better for everyone.
