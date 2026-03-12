const { execSync } = require('child_process');

try {
  const diff = execSync('git diff').toString();
  console.log("Git diff:\n", diff);
} catch (e) {
  console.error(e);
}
