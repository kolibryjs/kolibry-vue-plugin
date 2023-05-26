import semver from 'semver'
import colors from '@nyxb/picocolors'
import { confirm, select, text } from '@tyck/prompts'
import {
   args,
   getPackageInfo,
   getVersionChoices,
   isDryRun,
   logRecentCommits,
   packages,
   run,
   runIfNotDry,
   step,
   updateTemplateVersions,
   updateVersion,
} from './releaseUtils'

async function main(): Promise<void> {
   let targetVersion: string | undefined

   const pkg: string = (await select({
      message: 'Select package',
      options: packages.map(i => ({ value: i, label: i })),
   })) as string

   if (!pkg)
      return

   await logRecentCommits(pkg)

   const { currentVersion, pkgName, pkgPath, pkgDir } = getPackageInfo(pkg)

   if (!targetVersion) {
      const { release }: { release: string } = (await select({
         message: 'Select release type',
         options: getVersionChoices(currentVersion).map(i => ({ value: { release: i.value }, label: i.title })),
      })) as { release: string }

      if (release === 'custom') {
         const version: string = (await text({
            message: 'Input custom version',
            initialValue: currentVersion,
         })) as string
         targetVersion = version
      }
      else {
         targetVersion = release
      }
   }

   if (!semver.valid(targetVersion))
      throw new Error(`invalid target version: ${targetVersion}`)

   const tag = pkgName === 'kolibry' ? `v${targetVersion}` : `${pkgName}@${targetVersion}`

   if (targetVersion.includes('beta') && !args.tag)
      args.tag = 'beta'

   if (targetVersion.includes('alpha') && !args.tag)
      args.tag = 'alpha'

   const yes: boolean = (await confirm({
      message: `Releasing ${colors.yellow(tag)} Confirm?`,
   })) as boolean

   if (!yes)
      return

   step('\nUpdating package version...')
   updateVersion(pkgPath, targetVersion)
   if (pkgName === 'create-kolibry')
      updateTemplateVersions()

   step('\nGenerating changelog...')
   const changelogArgs = [
      'conventional-changelog',
      '-p',
      'angular',
      '-i',
      'CHANGELOG.md',
      '-s',
      '--commit-path',
      '.',
   ]
   if (pkgName !== 'kolibry')
      changelogArgs.push('--lerna-package', pkgName)
   await run('npx', changelogArgs, { cwd: pkgDir })

   const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
   if (stdout) {
      step('\nCommitting changes...')
      await runIfNotDry('git', ['add', '-A'])
      await runIfNotDry('git', ['commit', '-m', `release: ${tag}`])
      await runIfNotDry('git', ['tag', tag])
   }
   else {
      console.log('No changes to commit.')
      return
   }

   step('\nPushing to GitHub...')
   await runIfNotDry('git', ['push', 'origin', `refs/tags/${tag}`])
   await runIfNotDry('git', ['push'])

   if (isDryRun) {
      console.log('\nDry run finished - run git diff to see package changes.')
   }
   else {
      console.log(
         colors.green(
            '\nPushed, publishing should starts shortly on CI.\nhttps://github.com/kolibryjs/kolibry-vue-plugin/actions/workflows/publish.yml',
         ),
      )
   }

   console.log()
}

main().catch((err) => {
   console.error(err)
   process.exit(1)
})
