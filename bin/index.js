#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

try {
  const args = process.argv.slice(2).join(' ')
  const configPath = path.resolve(__dirname, '../cliff.toml')
  const fs = require('fs');
  const { execSync } = require('child_process');
  
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
  
          const [type, ...description] = message.split(':');
          const trimmedType = type.trim();
  
          // Verificar si el mensaje de commit está vacío
          if (description.length === 0) {
              return; // Ignorar mensajes de commit vacíos
          }
  
          if (trimmedType in groupedCommits) {
              groupedCommits[trimmedType].push({ description: description.join(':').trim(), hash, date });
          } else {
              groupedCommits[trimmedType] = [{ description: description.join(':').trim(), hash, date }];
          }
      });
  
      let changelog = '# Changelog\n';
  
      if (latestTag) {
          changelog += `## Cambios desde la versión  ${latestTag}\n\n`;
      } else {
          changelog += `## Cambios desde el inicio del proyecto\n\n`;
      }
  
      Object.keys(groupedCommits).forEach(type => {
          changelog += `### ${type}\n\n`;
          groupedCommits[type].forEach(commit => {
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
