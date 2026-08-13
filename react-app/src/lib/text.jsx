export function renderInlineText(text) {
  const re = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|1\d{10}|0\d{2,3}-?\d{7,8})/g;
  return String(text || "").split(re).map((part, i) => {
    if (!part) return null;
    if (/^https?:\/\//i.test(part)) {
      return <a key={i} href={part} target="_blank" rel="noreferrer">{part}</a>;
    }
    if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(part)) {
      return <a key={i} href={`mailto:${part}`}>{part}</a>;
    }
    if (/^1\d{10}$/.test(part) || /^0\d{2,3}-?\d{7,8}$/.test(part)) {
      return <a key={i} href={`tel:${part.replace(/-/g, "")}`}>{part}</a>;
    }
    return part;
  });
}
