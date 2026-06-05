export function ipCheck(target) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(target)) return false;
  return target.split('.').every((o) => Number(o) >= 0 && Number(o) <= 255);
}
