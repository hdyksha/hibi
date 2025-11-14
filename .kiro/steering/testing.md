# Testing Guidelines

## Test Execution Rules

### Output Management
- Always use `--reporter=basic` flag when running tests to minimize output
- For long-running tests, use `--reporter=dot` for even more concise output
- Avoid running tests in watch mode during automated execution

### Command Examples
```bash
# Minimal output for server tests
npm run test:server -- --reporter=basic

# Minimal output for client tests  
npm run test:client -- --reporter=basic

# Ultra-minimal output (dots only)
npm run test:server -- --reporter=dot

# Run specific test file to reduce output
npm run test:server -- src/services/todoService.test.ts --reporter=basic
```

### Best Practices
1. Run only relevant tests, not the entire test suite
2. Use `--reporter=basic` or `--reporter=dot` to reduce output
3. Consider running tests in smaller batches
4. If tests are timing out, increase timeout with `--testTimeout=10000`
5. Skip tests that are not relevant to current changes

### When to Run Tests
- Only run tests when explicitly requested by the user
- After making changes, suggest running specific test files rather than the entire suite
- If output is too long, recommend user runs tests manually in their terminal
