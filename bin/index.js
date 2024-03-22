#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
    const args = process.argv.slice(2).join(' ');
    const configPath = path.resolve(__dirname, '../cliff.toml');
    execSync(`git cliff -c ${configPath} --prepend ./CHANGELOG.md ${args}`, {
        stdio: 'inherit' // Redirect input/output/error to the parent process
    });
} catch (error) {
    console.log('Git cliff has errors');
    process.exit(1);
}
