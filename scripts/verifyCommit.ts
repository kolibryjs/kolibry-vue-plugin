// Invoked on the commit-msg git hook by simple-git-hooks.

import { readFileSync } from 'node:fs'
import color from '@nyxb/picocolors'
import consolji from 'consolji'

// get $1 from commit-msg script
const msgPath = process.argv[2]
const msg = readFileSync(msgPath, 'utf-8').trim()

const releaseRE = /^v\d/
const commitRE
  = /^(?:revert: )?(?:feat|fix|docs|dx|refactor|perf|test|workflow|build|ci|chore|types|wip|release|deps)(?:\(.+\))?!?: .{1,50}/

if (!releaseRE.test(msg) && !commitRE.test(msg)) {
   console.log()
   consolji.error(
    `  ${color.bgRed(color.white(' ERROR '))} ${color.red(
      'invalid commit message format.',
    )}\n\n${
      color.red(
        '  Proper commit message format is required for automated changelog generation. Examples:\n\n',
      )
      }    ${color.nicegreen('feat: add \'comments\' option')}\n`
      + `    ${color.nicegreen('fix: handle events on blur (close #28)')}\n\n${
      color.red('  See .github/commit-convention.md for more details.\n')}`,
   )
   process.exit(1)
}
