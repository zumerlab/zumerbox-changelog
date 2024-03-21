#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
    const args = process.argv.slice(2).join(' ');
    const configPath = path.resolve(__dirname, '../cliff.toml');
    const mdPath = path.resolve(__dirname, '../CHANGELOG.md');
    const result = execSync(`git cliff -c ${configPath} -o ${mdPath} ${args}`);
    
    // -o should be at root project
    // -u for unreleased
    // -l for latest commit tag
    console.log(result.toString()); // Print output of the command
} catch (error) {
    console.log('Git cliff has errors');
}
