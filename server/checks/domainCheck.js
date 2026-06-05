export function domainCheck(target) {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(target);
}
