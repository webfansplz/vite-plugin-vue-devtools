import { detect, parseNi, parseNr, parseNun } from '@antfu/ni'

// import { execaCommand } from 'execa'

import type { InstallPackageOptions } from '../../types'

export async function installPackage(packages: string[], options: InstallPackageOptions = {}) {
  const {
    isDev = false,
    cwd = process.cwd(),
    callback = () => { },
  } = options
  const agent = await detect({})

  const command = await parseNi(agent!, [...packages, ...(isDev ? ['-D'] : []), '--ignore-scripts'])
  const { execaCommand } = await import('execa')

  const _process = execaCommand(command!, {
    encoding: 'utf-8',
    cwd,
    env: {
      COLORS: 'true',
      FORCE_COLOR: 'true',
    },
  })

  callback('data', `\n\n> ${command}\n\n`)
  _process.stdout!.on('data', (data) => {
    callback('data', data.toString())
  })
  _process.stderr!.on('data', (data) => {
    callback('data', data.toString())
  })
  _process.on('exit', (code) => {
    callback('data', '\n\n> Successfully installed. \n\n')
    callback('exit', `${code}`)
  })
}

export async function uninstallPackage(packages: string[], options: InstallPackageOptions = {}) {
  const {
    isDev = false,
    cwd = process.cwd(),
    callback = () => { },
  } = options

  const agent = await detect({})

  const command = await parseNun(agent!, [...packages, ...(isDev ? ['-D'] : [])])
  const { execaCommand } = await import('execa')

  const _process = execaCommand(command!, {
    encoding: 'utf-8',
    cwd,
    env: {
      COLORS: 'true',
      FORCE_COLOR: 'true',
    },
  })

  callback('data', `\n\n> ${command}\n\n`)
  _process.stdout!.on('data', (data) => {
    callback('data', data.toString())
  })
  _process.stderr!.on('data', (data) => {
    callback('data', data.toString())
  })
  _process.on('exit', (code) => {
    callback('data', '\n\n> Successfully removed. \n\n')
    callback('exit', `${code}`)
  })
}

export async function execScript(script: string) {
  const agent = await detect({})
  const command = await parseNr(agent!, [script])
  await execaCommand(command!, { stdio: 'inherit', encoding: 'utf-8' })
}
