#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

try {
  const args = process.argv.slice(2).join(' ')
  const configPath = path.resolve(__dirname, '../compact-tinybox.hbs') 
  execSync(`auto-changelog -p -t ${configPath} --commit-limit false --hide-empty-releases --hide-credit ${args}`, {
    stdio: 'inherit'
  })

} catch (error) {
  console.log('Changelog has errors')
  process.exit(1)
}
