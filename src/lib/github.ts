export interface GithubRepo {
  name: string;
  html_url: string;
  description: string;
  updated_at: string;
  stargazers_count: number;
  language: string;
}

let repoCache: GithubRepo[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function fetchGithubRepos(username: string): Promise<GithubRepo[]> {
  const now = Date.now();
  if (repoCache && (now - lastFetchTime < CACHE_DURATION)) {
    return repoCache;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const data = await response.json();
    
    // Sort by updated_at descending just in case the API param doesn't guarantee it perfectly for all cases
    const sortedData = (data as GithubRepo[]).sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    repoCache = sortedData;
    lastFetchTime = now;
    return sortedData;
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    throw error;
  }
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInSeconds / 3600);
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
