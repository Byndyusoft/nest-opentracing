const normalizePath = (path: string): string => {
  const parts = path.split("/").filter(Boolean);

  return parts.join("/");
}

const splitUrl = (url: string): { path: string, additional: string } => {
  const additionalMark = ["?", "#"];
  const splitIndex = url
    .split("")
    .findIndex((char) => additionalMark.includes(char));

  if (splitIndex < 0) {
    return { path: url, additional: ""};
  }

  return { path: url.slice(0, splitIndex), additional: url.slice(splitIndex)}
}

export function getFullUrl(baseUrl: string, url: string): string {
  const { origin, pathname } = new URL(baseUrl);
  const { path, additional } = splitUrl(url);

  return `${origin}/${normalizePath(`${pathname}/${path}`)}${additional}`;
}

