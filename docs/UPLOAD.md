# Git Upload Protocol

This document defines the steps for uploading changes to the remote repository.

## 1. Pre-Flight Checks
- **Synchronize:** Pull the latest changes from the remote repository:
  `git pull`
- **Analyze Status:** Check current repository status:
  `git status`
- **Verify Tracking:** Ensure all relevant files are being tracked. Add any missing files:
  `git add <file_path>`

## 2. Review and Strategy
- **Review Changes:** Inspect modifications to understand the scope of changes:
  `git diff` or `git diff --staged`
- **Commit Strategy:** Plan commits based on distinct logical units (atomic commits).
  - **Do not** mix unrelated tasks in a single commit.

## 3. Safety and Quality Assurance
- **Validate:** Ensure all code is valid, secure, and meets project standards before staging.
- **CRITICAL:** **Do not** commit anything invalid, insecure, or incorrect.

## 4. Execution
- **Commit:** Execute commits based on your planned strategy.
- **Push:** Once all changes are committed appropriately, push to the remote repository:
  `git push`

## 5. Error Handling & Interruptions
- **Stop and Report:** If you encounter *any* issues (unexpected behavior, file inconsistencies, failed validations, or potential security risks), **immediately stop** execution and report the situation to the user for resolution.
- **Do Not Attempt Autonomous Resolution:** If the process deviates from expectations, do not attempt to fix it yourself. Request guidance from the user.

