# TrendFi Smart Contracts Test Suite

This directory contains comprehensive tests for all TrendFi smart contracts, ensuring robust functionality, security, and performance.

## 📁 Test Files Overview

### Core Contract Tests
- **`TrendFi.test.js`** - Tests for the main TrendFi contract (trend management)
- **`TrendToken.test.js`** - Tests for the ERC20 token contract
- **`TrendOracle.test.js`** - Tests for the oracle contract (price feeds)
- **`TrendMarket.test.js`** - Tests for the trading market contract

### Integration & Advanced Tests
- **`Integration.test.js`** - End-to-end integration tests
- **`helpers.js`** - Utility functions for testing
- **`mocks.js`** - Mock contracts and test data generators
- **`TestRunner.js`** - Comprehensive test orchestration

## 🧪 Test Coverage

### TrendFi Contract
- ✅ Deployment and initialization
- ✅ Trend creation and management
- ✅ Access control (owner-only functions)
- ✅ Data retrieval and validation
- ✅ Event emission
- ✅ Edge cases and error handling
- ✅ Gas optimization analysis

### TrendToken Contract
- ✅ ERC20 standard compliance
- ✅ Minting and burning functionality
- ✅ Transfer and approval mechanisms
- ✅ Access control for minting
- ✅ Batch operations
- ✅ Edge cases (zero amounts, max values)
- ✅ Gas usage optimization

### TrendOracle Contract
- ✅ Oracle data submission and verification
- ✅ Signature validation
- ✅ Data history management
- ✅ Oracle address updates
- ✅ Access control
- ✅ Data integrity verification
- ✅ Edge cases and malformed data

### TrendMarket Contract
- ✅ Market creation and management
- ✅ Position opening (long/short)
- ✅ Position closing and PnL calculation
- ✅ Price updates from oracle
- ✅ Fee calculation and collection
- ✅ Reentrancy protection
- ✅ Market state management
- ✅ Gas optimization

### Integration Tests
- ✅ Complete trading workflows
- ✅ Multi-contract interactions
- ✅ Oracle integration scenarios
- ✅ Token flow verification
- ✅ Complex trading scenarios
- ✅ Error handling across contracts
- ✅ Performance benchmarks

## 🚀 Running Tests

### Basic Test Execution
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/TrendFi.test.js

# Run with verbose output
npx hardhat test --verbose

# Run tests with gas reporting
npx hardhat test --report-gas
```

### Using the Test Runner
```bash
# Run comprehensive test suite
node -e "
const TestRunner = require('./test/TestRunner');
const runner = new TestRunner();
runner.initialize().then(() => runner.runAllTests());
"
```

### Performance Benchmarks
```bash
# Run performance tests
npx hardhat test test/Integration.test.js --grep "Performance"
```

## 📊 Test Categories

### 1. Unit Tests
- Individual contract functionality
- Function input/output validation
- Event emission verification
- Error condition testing

### 2. Integration Tests
- Cross-contract interactions
- End-to-end workflows
- Data flow validation
- State consistency checks

### 3. Security Tests
- Access control verification
- Reentrancy attack prevention
- Overflow/underflow protection
- Authorization boundary testing

### 4. Performance Tests
- Gas usage optimization
- Execution time measurement
- Batch operation efficiency
- Stress testing with large data

### 5. Edge Case Tests
- Boundary value testing
- Invalid input handling
- Empty/zero value scenarios
- Maximum capacity testing

## 🛠️ Test Utilities

### TestHelper Class
The `TestHelper` class provides utilities for:
- Contract deployment and setup
- Market configuration
- Trader setup with tokens
- Oracle data signing and submission
- Position management
- Gas usage measurement
- Time manipulation

### Mock Contracts
The `mocks.js` file includes:
- Mock ERC20 token with failure simulation
- Mock oracle for testing
- Mock price feed contracts
- Malicious contracts for security testing
- Data generation utilities

### Test Data Generation
Utilities for generating:
- Mock trend data
- Price history simulations
- Trading position scenarios
- Market condition scenarios

## 📈 Test Metrics

### Coverage Areas
- **Function Coverage**: 100% of all contract functions
- **Branch Coverage**: All conditional branches tested
- **Edge Case Coverage**: Boundary values and error conditions
- **Integration Coverage**: Cross-contract interactions

### Performance Benchmarks
- Gas usage for each operation
- Execution time measurements
- Memory usage analysis
- Batch operation efficiency

### Security Testing
- Reentrancy attack prevention
- Access control verification
- Input validation testing
- State consistency checks

## 🔧 Configuration

### Hardhat Configuration
```javascript
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};
```

### Test Environment Variables
```bash
# Enable detailed logging
TEST_VERBOSE=true

# Enable gas reporting
TEST_GAS_REPORT=true

# Enable performance testing
TEST_PERFORMANCE=true
```

## 📝 Test Writing Guidelines

### 1. Test Structure
```javascript
describe("ContractName", function () {
  let contract, signers;
  
  beforeEach(async function () {
    // Setup code
  });
  
  describe("Feature Group", function () {
    it("should do something", async function () {
      // Test code
    });
  });
});
```

### 2. Best Practices
- Use descriptive test names
- Test both success and failure cases
- Verify events are emitted correctly
- Check gas usage for expensive operations
- Use helper functions for repetitive setup
- Clean up state between tests

### 3. Error Testing
```javascript
it("should revert with proper error", async function () {
  await expect(contract.connect(user).restrictedFunction())
    .to.be.revertedWith("Expected error message");
});
```

### 4. Event Testing
```javascript
it("should emit correct event", async function () {
  await expect(contract.function())
    .to.emit(contract, "EventName")
    .withArgs(expectedArg1, expectedArg2);
});
```

## 🐛 Debugging Tests

### Common Issues
1. **Gas Limit Exceeded**: Increase gas limit or optimize contract
2. **Transaction Reverted**: Check error messages and preconditions
3. **Time-related Tests**: Use time manipulation utilities
4. **Random Failures**: Check for race conditions or state dependencies

### Debugging Tools
```bash
# Enable trace logging
npx hardhat test --trace

# Run specific test with verbose output
npx hardhat test test/Contract.test.js --grep "specific test" --verbose

# Generate coverage report
npx hardhat coverage
```

## 📋 Test Checklist

### Before Running Tests
- [ ] All dependencies installed
- [ ] Contracts compiled successfully
- [ ] Test environment configured
- [ ] Mock contracts deployed if needed

### After Test Execution
- [ ] All tests pass
- [ ] Coverage targets met
- [ ] Gas usage within limits
- [ ] No security vulnerabilities found
- [ ] Performance benchmarks acceptable

### Continuous Integration
- [ ] Tests run automatically on PR
- [ ] Coverage reports generated
- [ ] Gas usage tracked
- [ ] Security scans performed

## 🔄 Test Maintenance

### Regular Updates
- Update test cases when contracts change
- Add new tests for new features
- Review and optimize slow tests
- Update mock contracts as needed

### Performance Monitoring
- Track gas usage trends
- Monitor test execution time
- Identify performance regressions
- Optimize test suite efficiency

## 📚 Additional Resources

- [Hardhat Testing Documentation](https://hardhat.org/guides/writing-tests.html)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [Solidity Unit Testing Best Practices](https://blog.soliditylang.org/2021/08/26/solidity-0.8.8-release-announcement/)

---

## 🎯 Test Goals

1. **Reliability**: Ensure contracts work as expected under all conditions
2. **Security**: Identify and prevent vulnerabilities
3. **Performance**: Optimize gas usage and execution time
4. **Maintainability**: Keep tests readable and maintainable
5. **Coverage**: Achieve comprehensive test coverage

This test suite is designed to ensure the TrendFi smart contracts are production-ready, secure, and efficient.
