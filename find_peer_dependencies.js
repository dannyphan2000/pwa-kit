// You can use this file by setting the package name you'd like 
// to find the peer dependencies for on line 9
// node find_peer_dependencies.js &> out.txt

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

let packageName = 'pwa-kit-react-sdk'
// Load package.json
const packagePath = path.resolve(`./packages/${packageName}/package.json`);
if (!fs.existsSync(packagePath)) {
    console.error('Error: package.json not found in the current directory.');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
};

if (!Object.keys(dependencies).length) {
    console.log('No dependencies or devDependencies found in package.json.');
    process.exit(0);
}

console.log('Checking peerDependencies for the following packages:');
console.log(Object.keys(dependencies).join(', '));
console.log();

Object.keys(dependencies).forEach((dependency) => {
    exec(`npm info ${dependency} peerDependencies --json`, (error, stdout, stderr) => {
        try {
            const peerDependencies = JSON.parse(stdout);
            console.log(`\n@@@ ${dependency}:`);
            console.log(peerDependencies);
        } catch (parseError) {
            console.error(`Failed to parse peerDependencies for ${dependency}:`, stdout);
        }
    });
});