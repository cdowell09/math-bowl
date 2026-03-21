const HEADING_PATTERN = /^\s{0,3}#{1,6}\s+/gm;
const LIST_PATTERN = /^\s{0,3}[-*+]\s+/gm;
const BLOCKQUOTE_PATTERN = /^\s{0,3}>\s?/gm;
const LINK_PATTERN = /\[([^\]]+)\]\((?:[^()]+|\([^()]*\))*\)/g;
const INLINE_CODE_PATTERN = /`([^`]+)`/g;
const STRONG_EMPHASIS_PATTERN = /(\*\*|__)(.*?)\1/g;
const EMPHASIS_PATTERN = /(\*|_)(.*?)\1/g;
const FENCE_PATTERN = /^\s*```[^\n]*\n?|\n?\s*```\s*$/gm;

function trimPunctuationSpacing(value: string): string {
  return value.replace(/\s+([.,!?;:])/g, '$1');
}

export function sanitizeTutorSpeech(content: string): string {
  return trimPunctuationSpacing(
    content
      .replace(/\r\n?/g, '\n')
      .replace(FENCE_PATTERN, '\n')
      .replace(HEADING_PATTERN, '')
      .replace(LIST_PATTERN, '')
      .replace(BLOCKQUOTE_PATTERN, '')
      .replace(LINK_PATTERN, '$1')
      .replace(INLINE_CODE_PATTERN, '$1')
      .replace(STRONG_EMPHASIS_PATTERN, '$2')
      .replace(EMPHASIS_PATTERN, '$2')
      .replace(/[`*_]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}
