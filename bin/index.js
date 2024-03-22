#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

try {
  const args = process.argv.slice(2).join(' ')
  const configPath = path.resolve(__dirname, '../cliff.toml')

  function generateChangelog() {
    let latestTag
    try {
      latestTag = execSync('git describe --tags --abbrev=0').toString().trim()
    } catch (error) {
      // No hay tags, asumir que es el primer release
      latestTag = ''
    }

    let commits
    if (latestTag) {
      commits = execSync(`git log --pretty=format:'%s' ${latestTag}..HEAD`)
        .toString()
        .trim()
        .split('\n')
    } else {
      commits = execSync('git log --pretty=format:"%s"')
        .toString()
        .trim()
        .split('\n')
    }

    let groupedCommits = {}

    commits.forEach((commit) => {
      const [type, ...description] = commit.split(':')
      const trimmedType = type.trim()

      if (trimmedType in groupedCommits) {
        groupedCommits[trimmedType].push(description.join(':').trim())
      } else {
        groupedCommits[trimmedType] = [description.join(':').trim()]
      }
    })

    let changelog = ''

    Object.keys(groupedCommits).forEach((type) => {
      changelog += `### ${type}\n\n`
      groupedCommits[type].forEach((description) => {
        changelog += `- ${description}\n`
      })
      changelog += '\n'
    })

    return changelog
  }

  function updateChangelog(changelog) {
    let existingChangelog = ''

    try {
      existingChangelog = fs.readFileSync('CHANGELOG.md', 'utf8')
    } catch (err) {
      // No existe un changelog, se creará uno nuevo
    }

    if (existingChangelog) {
      // Se agrega el nuevo changelog al inicio
      fs.writeFileSync('CHANGELOG.md', changelog + '\n' + existingChangelog)
    } else {
      // Se crea un nuevo changelog
      fs.writeFileSync('CHANGELOG.md', changelog)
    }
  }

  const newChangelog = generateChangelog()
  updateChangelog(newChangelog)
  console.log('Changelog generado o actualizado correctamente.')
} catch (error) {
  console.log('Changelog has errors')
  process.exit(1)
}
