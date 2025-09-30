import axios from 'axios'

interface CommitOptions {
  owner?: string
  repo?: string
  branch?: string
  message?: string
}

function getRepoContext() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER
  const repo = process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG
  const branch = process.env.GITHUB_BRANCH || 'main'

  if (!token) {
    throw new Error('Missing GITHUB_TOKEN')
  }
  if (!owner || !repo) {
    throw new Error('Missing GitHub repository context (owner/repo)')
  }

  return { token, owner, repo, branch }
}

async function getFileSha(path: string, options?: CommitOptions): Promise<string | null> {
  const { token, owner, repo, branch } = { ...getRepoContext(), ...options }
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
        params: { ref: branch },
      }
    )
    return res.data.sha || null
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null
    }
    throw err
  }
}

export async function commitFileToGitHub(
  filePath: string,
  content: string,
  commitMessage: string,
  options?: CommitOptions
) {
  const { token, owner, repo, branch } = { ...getRepoContext(), ...options }
  const sha = await getFileSha(filePath, options)

  const res = await axios.put(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`,
    {
      message: commitMessage,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
      sha: sha || undefined,
    },
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  )

  return res.data
}


