#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

try {
  const args = process.argv.slice(2).join(' ')
  const configPath = path.resolve(__dirname, '../cliff.toml') 
  
 

const commitParsers = [
    { message: "^feat", group: "<!-- 0 -->🚀 Features" },
    { message: "^fix", group: "<!-- 1 -->🐛 Bug Fixes" },
    { message: "^doc", group: "<!-- 3 -->📚 Documentation" },
    { message: "^perf", group: "<!-- 4 -->⚡ Performance" },
    { message: "^refactor", group: "<!-- 2 -->🚜 Refactor" },
    { message: "^style", group: "<!-- 5 -->🎨 Styling" },
    { message: "^test", group: "<!-- 6 -->🧪 Testing" },
    { message: "^chore\\(release\\): prepare for", skip: true },
    { message: "^chore\\(deps.*\\)", skip: true },
    { message: "^chore\\(pr\\)", skip: true },
    { message: "^chore\\(pull\\)", skip: true },
    { message: "^chore|^ci", group: "<!-- 7 -->⚙️ Miscellaneous Tasks" },
    { body: ".*security", group: "<!-- 8 -->🛡️ Security" },
    { message: "^revert", group: "<!-- 9 -->◀️ Revert" },
];

function matchCommit(commitMessage) {
    for (const parser of commitParsers) {
        if (parser.message && commitMessage.match(parser.message)) {
            return parser.group;
        } else if (parser.body && commitMessage.match(parser.body)) {
            return parser.group;
        }
    }
    return null;
}

function generateChangelog() {
    let latestTag;
    try {
        latestTag = execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (error) {
        // No hay tags, asumir que es el primer release
        latestTag = '';
    }

    let commits;
    if (latestTag) {
        commits = execSync(`git log --pretty=format:'%s %H %ad' ${latestTag}..HEAD`).toString().trim().split('\n');
    } else {
        commits = execSync('git log --pretty=format:"%s %H %ad"').toString().trim().split('\n');
    }

    let groupedCommits = {};

    commits.forEach(commit => {
        const [message, hash, date] = commit.split(' ');

        const group = matchCommit(message);

        if (group) {
            if (group in groupedCommits) {
                groupedCommits[group].push({ description: message, hash, date });
            } else {
                groupedCommits[group] = [{ description: message, hash, date }];
            }
        }
    });

    let changelog = '';

    if (latestTag) {
        changelog += `## Cambios desde el tag ${latestTag}\n\n`;
    } else {
        changelog += `## Cambios desde el inicio del proyecto\n\n`;
    }

    Object.keys(groupedCommits).forEach(group => {
        changelog += `${group}\n\n`;
        groupedCommits[group].forEach(commit => {
            changelog += `- ${commit.description} (${commit.hash}) - ${commit.date}\n`;
        });
        changelog += '\n';
    });

    return changelog;
}

function updateChangelog(changelog) {
    let existingChangelog = '';

    try {
        existingChangelog = fs.readFileSync('CHANGELOG.md', 'utf8');
    } catch (err) {
        // No existe un changelog, se creará uno nuevo
    }

    if (existingChangelog) {
        // Se agrega el nuevo changelog al inicio
        fs.writeFileSync('CHANGELOG.md', changelog + '\n' + existingChangelog);
    } else {
        // Se crea un nuevo changelog
        fs.writeFileSync('CHANGELOG.md', changelog);
    }
}

const newChangelog = generateChangelog();
updateChangelog(newChangelog);
console.log('Changelog generado o actualizado correctamente.');


} catch (error) {
  console.log('Changelog has errors')
  process.exit(1)
}
