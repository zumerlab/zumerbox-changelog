#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
    const args = process.argv.slice(2).join(' ');
    const configPath = path.resolve(__dirname, '../cliff.toml');
    const mdPath = path.resolve(__dirname, '../CHANGELOG.md');
    execSync(`git cliff -c ${configPath} -o ${mdPath} ${args}`, {
        stdio: 'inherit' // Redirect input/output/error to the parent process
    });
} catch (error) {
    console.log('Git cliff has errors');
}
