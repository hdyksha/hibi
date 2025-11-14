# Testing Guidelines

## Test Execution Rules

### Output Management Strategy
**CRITICAL**: Long-running tests can generate massive output due to loading animations in the UI, even when using minimal reporters. To prevent this:

1. **Always redirect test output to a file** and read the file afterwards
2. Use `--reporter=basic` or `--reporter=json` for file output
3. Never run tests in watch mode during automated execution

### Recommended Command Pattern
```bash
# Server tests - output to file
npm run test:server -- --reporter=basic > tmp/test-results.txt 2>&1

# Client tests - output to file
npm run test:client -- --reporter=basic > tmp/test-results.txt 2>&1

# JSON output for programmatic parsing
npm run test:server -- --reporter=json > tmp/test-results.json 2>&1

# Specific test file
npm run test:server -- src/services/todoService.test.ts --reporter=basic > tmp/test-results.txt 2>&1
```

### After Running Tests
1. Read the output file using `readFile` tool
2. Analyze results and report to user
3. Clean up the output file if needed

### Alternative: Silent Mode
If file output is not suitable, use `--silent` or `--reporter=tap` with `--run`:
```bash
npm run test:server -- --reporter=tap --run
```

### Best Practices
1. Run only relevant tests, not the entire test suite
2. Always redirect output to `tmp/test-results.txt` or similar
3. Use `--run` flag to ensure tests exit after completion
4. Consider running tests in smaller batches
5. If tests are timing out, increase timeout with `--testTimeout=10000`

### When to Run Tests
- Only run tests when explicitly requested by the user
- After making changes, suggest running specific test files rather than the entire suite
- Always use file output redirection to avoid UI loading animation issues
