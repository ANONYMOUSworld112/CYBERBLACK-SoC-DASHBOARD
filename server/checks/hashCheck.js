export function hashCheck(target) {
  return /^[a-f0-9]{32}$/i.test(target)
      || /^[a-f0-9]{40}$/i.test(target)
      || /^[a-f0-9]{64}$/i.test(target);
}
