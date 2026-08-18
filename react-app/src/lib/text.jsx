import { useState } from "react";

// ---------- 行内链接/邮箱/电话 ----------
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

// ---------- 轻量语法高亮（零依赖，覆盖 Shell/Python/JSON 常见语法） ----------
const HL = {
  comment: /(#[^\n]*|--[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
  string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g,
  number: /\b(\d+(?:\.\d+)?)\b/g,
  keyword: /\b(def|return|import|from|as|class|if|elif|else|for|while|in|not|and|or|try|except|finally|with|lambda|pass|break|continue|None|True|False|echo|export|local|function|then|fi|done|case|esac|do|while|until|if|cd|rm|cp|mv|mkdir|chmod|chown|grep|awk|sed|curl|wget|systemctl|docker|kubectl|pip|python3|sudo)\b/g,
  flag: /(--?[\w-]+)/g,
  env: /(\$\{?[\w]+\}?)/g,
};

function highlightLine(line) {
  // 逐 token 匹配，按出现顺序合并
  const tokens = [];
  const pattern = new RegExp(
    [HL.comment.source, HL.string.source, HL.number.source, HL.flag.source, HL.env.source, HL.keyword.source].join("|"),
    "g"
  );
  let last = 0;
  let m;
  while ((m = pattern.exec(line)) !== null) {
    if (m.index > last) tokens.push(<span key={tokens.length}>{line.slice(last, m.index)}</span>);
    const raw = m[0];
    let cls = "tok";
    if (HL.comment.test(raw) && raw.startsWith("#") || raw.startsWith("--") || raw.startsWith("//") || raw.startsWith("/*")) cls = "c";
    else if (raw.startsWith('"') || raw.startsWith("'") || raw.startsWith("`")) cls = "s";
    else if (/^\d/.test(raw)) cls = "n";
    else if (/^--?[\w-]+$/.test(raw)) cls = "f";
    else if (/^\$\{?[\w]/.test(raw)) cls = "e";
    else cls = "k";
    tokens.push(<span key={tokens.length} className={`tok-${cls}`}>{raw}</span>);
    last = m.index + raw.length;
  }
  if (last < line.length) tokens.push(<span key={tokens.length}>{line.slice(last)}</span>);
  return tokens;
}

// ---------- 代码块组件（高亮 + 复制） ----------
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      /* 剪贴板不可用时忽略 */
    }
  }
  const lines = code.split("\n");
  return (
    <div className="md-codeblock">
      <div className="md-codeblock-head">
        <span className="md-codeblock-lang">{lang || "code"}</span>
        <button className="md-codeblock-copy" onClick={copy} type="button">
          {copied ? "✓ 已复制" : "复制"}
        </button>
      </div>
      <pre className="md-codeblock-pre">
        <code>
          {lines.map((line, i) => (
            <div className="md-code-line" key={i}>
              <span className="md-code-line-no">{i + 1}</span>
              <span className="md-code-line-body">{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// ---------- 完整消息渲染：Markdown 代码块 + 行内代码 + 链接 + 换行 ----------
const CODE_BLOCK_RE = /```([\w-]*)\n?([\s\S]*?)```/g;

export function renderMessage(text) {
  const source = String(text || "");
  const parts = [];
  let last = 0;
  let m;
  let key = 0;
  while ((m = CODE_BLOCK_RE.exec(source)) !== null) {
    if (m.index > last) {
      parts.push(renderPlain(source.slice(last, m.index), key++));
    }
    parts.push(<CodeBlock key={`code${key++}`} lang={m[1]} code={m[2].replace(/\n$/, "")} />);
    last = m.index + m[0].length;
  }
  if (last < source.length) {
    parts.push(renderPlain(source.slice(last), key++));
  }
  if (!parts.length) return null;
  return <>{parts}</>;
}

// 非代码块部分：行内代码 + 链接/邮箱/电话 + 换行
function renderPlain(segment, keyBase) {
  const inlineRe = /(`[^`]+`)/g;
  const segs = segment.split(inlineRe);
  return (
    <span key={keyBase}>
      {segs.map((s, i) => {
        if (!s) return null;
        if (s.startsWith("`") && s.endsWith("`")) {
          return <code className="md-inline-code" key={i}>{s.slice(1, -1)}</code>;
        }
        return <span key={i}>{renderInlineText(s)}</span>;
      })}
    </span>
  );
}
