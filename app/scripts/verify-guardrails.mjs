#!/usr/bin/env node
/* global process, console */
/**
 * KR1688 Guardrail Verifier
 *
 * Scans active source/config files for forbidden patterns:
 *   sitemap, RSS, JSON-LD, IndexNow, Payload search/SEO plugins,
 *   MongoDB adapter, real .env files, committed credential patterns.
 *
 * Usage:
 *   node scripts/verify-guardrails.mjs                    # production mode
 *   node scripts/verify-guardrails.mjs --fixture <path>   # test mode
 *   node scripts/verify-guardrails.mjs --status-fixture <path>
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { resolve, relative, basename, join } from 'node:path'

// --------------- forbidden patterns ---------------
// Use simple string includes for most checks to avoid regex OOM.
// Only use regex for patterns that genuinely need it.

const FORBIDDEN_STRINGS = [
  { name: 'sitemap', strs: ['next-sitemap', '@next/sitemap', 'generateSitemaps'],
    regexes: [/sitemap\.xml/i, /sitemap\.ts$/i] },
  { name: 'RSS route', strs: ['rss.xml', 'RSS.xml', 'generateRss', 'RSSFeed'],
    regexes: [/feed\.xml/i, /atom\.xml/i] },
  { name: 'JSON-LD output', strs: ['json-ld', 'JsonLd', 'json+ld', 'application/ld+json',
    'structuredData', 'SchemaOrgArticle'],
    regexes: [/schema\.org.*Article/i] },
  { name: 'IndexNow', strs: ['IndexNow', 'indexnow', 'index-now'], regexes: [] },
  { name: 'search/SEO plugins', strs: ['@payloadcms/plugin-search', '@payloadcms/plugin-seo',
    'pluginSeo', 'pluginSearch'], regexes: [] },
  { name: 'MongoDB adapter', strs: ['@payloadcms/db-mongodb', 'mongoose', 'mongodb'],
    regexes: [] },
  { name: 'real credentials', strs: ['API_KEY=', 'SECRET_KEY=', 'ACCESS_KEY=',
    'PRIVATE_KEY=', 'PASSWORD=', 'DB_PASSWORD=', 'DATABASE_PASSWORD='], regexes: [] },
]

const EXCLUDED_DIRS = new Set(['node_modules', '.next', 'out', 'build', '.git', '.pnpm', 'dist'])

function isExcluded(relPath) {
  for (const p of relPath.split('/')) {
    if (EXCLUDED_DIRS.has(p)) return true
  }
  return false
}

function walkSync(dir, baseDir, fileList = []) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return fileList }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relPath = relative(baseDir, fullPath)
    if (isExcluded(relPath)) continue
    if (entry.isDirectory()) { walkSync(fullPath, baseDir, fileList) }
    else if (entry.isFile()) { fileList.push(fullPath) }
  }
  return fileList
}

function scanFile(filePath) {
  const findings = []
  const relPath = relative(resolve('.'), filePath)

  // .env file detection (path-only)
  const fn = basename(filePath)
  if (fn === '.env' && fn !== '.env.example') {
    findings.push({ file: relPath, rule: 'committed .env', match: fn })
    return findings
  }

  try {
    const stat = statSync(filePath)
    if (stat.size > 2 * 1024 * 1024) return findings
    const content = readFileSync(filePath, 'utf-8')
    for (const rule of FORBIDDEN_STRINGS) {
      // Simple string match (case-insensitive)
      const lower = content.toLowerCase()
      for (const s of rule.strs) {
        if (lower.includes(s.toLowerCase())) {
          const idx = lower.indexOf(s.toLowerCase())
          const line = content.substring(0, idx).split('\n').length
          findings.push({ file: relPath, rule: rule.name, match: s, line })
        }
      }
      // Regex matches
      for (const re of rule.regexes) {
        let m
        while ((m = re.exec(content)) !== null) {
          const line = content.substring(0, m.index).split('\n').length
          findings.push({ file: relPath, rule: rule.name, match: m[0], line })
        }
      }
    }
  } catch { /* binary or unreadable */ }
  return findings
}

function verifyAcceptanceStatus(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  if (!/^acceptance_requested:\s*true\s*$/m.test(content)) return []

  const findings = []
  if (!/^ci_conclusion:\s*success\s*$/m.test(content)) {
    findings.push('acceptance_requested requires ci_conclusion: success')
  }
  if (!/^head_sha:\s*[a-f0-9]{40}\s*$/m.test(content)) {
    findings.push('acceptance_requested requires a 40-character head_sha')
  }
  if (!/^ci_url:\s*https:\/\/github\.com\/[^\s]+\/actions\/runs\/\d+\s*$/m.test(content)) {
    findings.push('acceptance_requested requires a GitHub Actions run URL')
  }
  return findings
}

// --------------- main ---------------

async function main() {
  const args = process.argv.slice(2)
  const fixtureIdx = args.indexOf('--fixture')
  const statusFixtureIdx = args.indexOf('--status-fixture')

  if (fixtureIdx !== -1 && args[fixtureIdx + 1]) {
    const fixturePath = resolve(args[fixtureIdx + 1])
    if (!existsSync(fixturePath)) {
      console.error(`Fixture not found: ${fixturePath}`)
      process.exit(2)
    }
    const findings = scanFile(fixturePath)
    if (findings.length > 0) {
      for (const f of findings) {
        console.log(`[${f.rule}] ${f.file}:${f.line ?? 'N/A'} — ${f.match}`)
      }
      console.log(`\n${findings.length} guardrail violation(s) found.`)
      process.exit(1)
    }
    console.log('Guardrail check passed (fixture mode).')
    process.exit(0)
  }

  if (statusFixtureIdx !== -1 && args[statusFixtureIdx + 1]) {
    const fixturePath = resolve(args[statusFixtureIdx + 1])
    if (!existsSync(fixturePath)) {
      console.error(`Fixture not found: ${fixturePath}`)
      process.exit(2)
    }
    const findings = verifyAcceptanceStatus(fixturePath)
    if (findings.length > 0) {
      findings.forEach((finding) => console.log(`[status] ${finding}`))
      process.exit(1)
    }
    console.log('Status guardrail check passed (fixture mode).')
    process.exit(0)
  }

  // Production mode
  const baseDir = resolve('.')
  const srcDir = join(baseDir, 'src')
  const scriptsDir = join(baseDir, 'scripts')
  const filesToScan = []
  const allFindings = []

  if (existsSync(srcDir)) walkSync(srcDir, baseDir, filesToScan)

  if (existsSync(baseDir)) {
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue
      const parts = entry.name.split('.')
      const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : ''
      if (['mjs', 'js', 'ts', 'json', 'yaml', 'yml'].includes(ext) || entry.name.startsWith('.env')) {
        filesToScan.push(join(baseDir, entry.name))
      }
    }
  }

  if (existsSync(scriptsDir)) walkSync(scriptsDir, baseDir, filesToScan)

  const statusPath = join(baseDir, 'docs', 'executor', 'STATUS.yaml')
  if (existsSync(statusPath)) {
    const statusFindings = verifyAcceptanceStatus(statusPath)
    for (const finding of statusFindings) {
      allFindings.push({ file: relative(baseDir, statusPath), rule: 'acceptance status', match: finding })
    }
  }

  const uniqueFiles = [...new Set(filesToScan)]
    .filter((f) => {
      const rel = relative(baseDir, f)
      if (isExcluded(rel)) return false
      if (rel.startsWith('docs/')) return false
      if (rel.startsWith('tests/fixtures/')) return false
      // Exclude self
      if (rel === 'scripts/verify-guardrails.mjs') return false
      // Exclude .env.example (safe template)
      if (rel === '.env.example') return false
      return true
    })

  for (const f of uniqueFiles) {
    allFindings.push(...scanFile(f))
  }

  if (allFindings.length > 0) {
    for (const f of allFindings) {
      console.log(`[${f.rule}] ${f.file}:${f.line ?? 'N/A'} — ${f.match}`)
    }
    console.log(`\n${allFindings.length} guardrail violation(s) found.`)
    process.exit(1)
  }

  console.log('Guardrail check passed — zero forbidden patterns found.')
  process.exit(0)
}

main().catch((e) => {
  console.error('Guardrail verifier crashed:', e.message)
  process.exit(2)
})
