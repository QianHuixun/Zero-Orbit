export function postHref(id: string) {
  return `/posts/${id}/`;
}

export function channelHref(slug: string) {
  return `/channels/${slug}/`;
}

export function tagHref(tag: string) {
  return `/tags/${encodeURIComponent(tag)}/`;
}
