# Command Execution Guidelines

## Interactive Commands
When executing commands that may require user interaction, always use non-interactive options:

### Git Commands
- `git diff --no-pager` - View diffs without pagination
- `git log --no-pager` - View logs without pagination
- `git show --no-pager` - Show commits without pagination
- `git branch --no-pager` - List branches without pagination

### General Rule
For any command that might open an interactive pager or prompt for user input, use appropriate flags to ensure non-interactive execution:
- Git: `--no-pager` flag
- Less/More: Use `cat` instead or pipe to `head`/`tail`
- Interactive prompts: Use `-y`, `--yes`, `--force`, or equivalent flags

This ensures smooth automation and prevents commands from blocking execution waiting for user input.
