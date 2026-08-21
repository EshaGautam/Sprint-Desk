export interface JsonPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/**
 * Fetch simulated notification posts from JSONPlaceholder using the exact limit endpoint.
 */
export async function fetchNotificationPosts(): Promise<JsonPost[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}
