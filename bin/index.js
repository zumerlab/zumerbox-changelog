#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const CHANGELOG_PATH = path.resolve(process.cwd(), 'CHANGELOG.md')
const TEMPLATE_PATH = path.resolve(__dirname, '..', 'compact-tinybox.hbs')
const HEADER =
  '### Changelog\n\nAll notable changes to this project will be documented in this file.\n\n'
const IGNORE_PATTERN =
  '^Bumped version|^Create LICENSE|^Update README|^Update LICENSE|^Update CHANGELOG'

function autoChangelog(extraArgs) {
  return execSync(
    `auto-changelog -p --stdout -t "${TEMPLATE_PATH}" --commit-limit false --hide-empty-releases --hide-credit --ignore-commit-pattern "${IGNORE_PATTERN}" ${extraArgs}`,
    { encoding: 'utf8' }
  )
}

function getLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return null
  }
}

function stripHeader(text) {
  return text.replace(
    /^### Changelog\s*\n\nAll notable changes[^\n]*\n+/,
    ''
  )
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findHeading(content, version) {
  const re = new RegExp(
    `^#{3,4}\\s+\\[?v?${escapeRegex(version)}(?=[\\s\\]])`,
    'm'
  )
  const m = re.exec(content)
  return m ? m.index : -1
}

function findNextHeading(content, fromIndex) {
  const lineEnd = content.indexOf('\n', fromIndex)
  if (lineEnd < 0) return -1
  const start = lineEnd + 1
  const re = /^#{3,4}\s+\[?v?\d+\.\d+\.\d+/m
  const m = re.exec(content.slice(start))
  return m ? start + m.index : -1
}

const userArgs = process.argv.slice(2).join(' ')

try {
  // Bootstrap: no CHANGELOG.md → render full history once
  if (!fs.existsSync(CHANGELOG_PATH)) {
    fs.writeFileSync(CHANGELOG_PATH, autoChangelog(userArgs))
    console.log('CHANGELOG.md created.')
    process.exit(0)
  }

  // Render only the latest release section
  const latestTag = getLatestTag()
  const startingArg = latestTag ? `--starting-version ${latestTag}` : ''
  let section = stripHeader(autoChangelog(`${startingArg} ${userArgs}`))
    .trimEnd()
  if (!section.trim()) {
    console.log('No release entry to add.')
    process.exit(0)
  }
  section += '\n\n'

  const verMatch = /v(\d+\.\d+\.\d+(?:-[a-z0-9.]+)?)/i.exec(section)
  if (!verMatch) {
    console.log('Could not parse version from generated section.')
    process.exit(1)
  }
  const version = verMatch[1]

  let content = fs.readFileSync(CHANGELOG_PATH, 'utf8')
  if (!content.startsWith('### Changelog')) {
    content = HEADER + content
  }

  const introIdx = content.indexOf('All notable changes')
  const blankIdx = content.indexOf('\n\n', introIdx)
  const headerEnd = blankIdx >= 0 ? blankIdx + 2 : content.length
  const before = content.slice(0, headerEnd)
  let after = content.slice(headerEnd)

  const existingIdx = findHeading(after, version)
  if (existingIdx >= 0) {
    const nextIdx = findNextHeading(after, existingIdx + 1)
    const tail = nextIdx >= 0 ? after.slice(nextIdx) : ''
    after = after.slice(0, existingIdx) + section + tail
    console.log(`Updated v${version} entry in CHANGELOG.md.`)
  } else {
    after = section + after
    console.log(`Prepended v${version} entry to CHANGELOG.md.`)
  }

  fs.writeFileSync(CHANGELOG_PATH, before + after)
} catch (error) {
  console.error('Changelog has errors')
  console.error(error.message || error)
  process.exit(1)
}
