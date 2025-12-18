const fs = require('fs');
const { execSync } = require('child_process');
const semver = require('semver');

try {
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;

  console.log(`Current version: ${currentVersion}`);

  // Get version from origin/master
  // We use a try-catch block for the git command specifically to handle cases where origin/master might not be available or reachable,
  // though in the CI environment with fetch-depth: 0 it should be.
  let masterPackageJsonStr;
  try {
      masterPackageJsonStr = execSync('git show origin/master:package.json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (e) {
      console.warn('Warning: Could not fetch package.json from origin/master. Assuming this is a new repo or branch setup. Skipping version check.');
      process.exit(0);
  }

  const masterPackageJson = JSON.parse(masterPackageJsonStr);
  const masterVersion = masterPackageJson.version;

  console.log(`Master version: ${masterVersion}`);

  if (semver.gt(currentVersion, masterVersion)) {
    console.log('Version check passed.');
    process.exit(0);
  } else {
    console.error(`Error: Current version (${currentVersion}) must be greater than master version (${masterVersion}).`);
    process.exit(1);
  }
} catch (error) {
  console.error('An unexpected error occurred during version check:', error);
  process.exit(1);
}
