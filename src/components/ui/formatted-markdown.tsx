import React from "react";
import { Linking, Text, TextStyle, View } from "react-native";
import { MUTED, ORANGE, TEXT } from "@/constants/palette";

interface FormattedMarkdownProps {
  content: string;
  baseStyle?: TextStyle;
}

type InlineToken =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; url: string };

function parseInlineTokens(input: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|\[(.*?)\]\((.*?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", text: input.substring(lastIndex, match.index) });
    }

    if (match[1].startsWith("**")) {
      tokens.push({ type: "bold", text: match[2] || "" });
    } else if (match[1].startsWith("*")) {
      tokens.push({ type: "italic", text: match[3] || "" });
    } else if (match[1].startsWith("`")) {
      tokens.push({ type: "code", text: match[4] || "" });
    } else if (match[1].startsWith("[")) {
      tokens.push({ type: "link", text: match[5] || "", url: match[6] || "" });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    tokens.push({ type: "text", text: input.substring(lastIndex) });
  }

  return tokens;
}

function renderInlineText(text: string, baseStyle?: TextStyle) {
  const tokens = parseInlineTokens(text);
  return tokens.map((token, index) => {
    switch (token.type) {
      case "bold":
        return (
          <Text key={index} style={[baseStyle, { fontWeight: "700" }]}>
            {token.text}
          </Text>
        );
      case "italic":
        return (
          <Text key={index} style={[baseStyle, { fontStyle: "italic" }]}>
            {token.text}
          </Text>
        );
      case "code":
        return (
          <Text
            key={index}
            style={[
              baseStyle,
              {
                fontFamily: "monospace",
                backgroundColor: "rgba(255, 149, 0, 0.12)",
                color: ORANGE,
                paddingHorizontal: 4,
                borderRadius: 4,
                fontSize: ((baseStyle?.fontSize as number) || 14) * 0.9,
              },
            ]}
          >
            {token.text}
          </Text>
        );
      case "link":
        return (
          <Text
            key={index}
            style={[baseStyle, { color: ORANGE, textDecorationLine: "underline" }]}
            onPress={() => {
              if (token.url) void Linking.openURL(token.url).catch(() => {});
            }}
          >
            {token.text}
          </Text>
        );
      default:
        return (
          <Text key={index} style={baseStyle}>
            {token.text}
          </Text>
        );
    }
  });
}

export function FormattedMarkdown({ content, baseStyle }: FormattedMarkdownProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <View
            key={`code-block-${i}`}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.25)",
              padding: 10,
              borderRadius: 8,
              marginVertical: 4,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <Text style={{ fontFamily: "monospace", color: "#e2e8f0", fontSize: 13, lineHeight: 18 }}>
              {codeBlockBuffer.join("\n")}
            </Text>
          </View>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<View key={`space-${i}`} style={{ height: 4 }} />);
      continue;
    }

    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const fontSize = Math.max(15, 22 - level * 1.5);
      elements.push(
        <Text
          key={`header-${i}`}
          style={[
            baseStyle,
            {
              fontSize,
              fontWeight: "700",
              color: TEXT,
              marginTop: 6,
              marginBottom: 4,
            },
          ]}
        >
          {renderInlineText(headerText, { fontSize, fontWeight: "700" })}
        </Text>
      );
      continue;
    }

    const listMatch = trimmed.match(/^([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const bullet = listMatch[1].match(/\d+\./) ? listMatch[1] : "•";
      const itemText = listMatch[2];
      elements.push(
        <View key={`list-${i}`} style={{ flexDirection: "row", alignItems: "flex-start", marginVertical: 2, paddingLeft: 4 }}>
          <Text style={[baseStyle, { color: ORANGE, fontWeight: "700", width: 16, marginRight: 4 }]}>
            {bullet}
          </Text>
          <Text style={[{ flex: 1 }, baseStyle]}>
            {renderInlineText(itemText, baseStyle)}
          </Text>
        </View>
      );
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteText = trimmed.replace(/^>\s*/, "");
      elements.push(
        <View
          key={`quote-${i}`}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: ORANGE,
            paddingLeft: 8,
            marginVertical: 4,
            opacity: 0.9,
          }}
        >
          <Text style={[baseStyle, { fontStyle: "italic", color: MUTED }]}>
            {renderInlineText(quoteText, baseStyle)}
          </Text>
        </View>
      );
      continue;
    }

    elements.push(
      <Text key={`p-${i}`} style={[baseStyle, { marginVertical: 1 }]}>
        {renderInlineText(line, baseStyle)}
      </Text>
    );
  }

  if (inCodeBlock && codeBlockBuffer.length > 0) {
    elements.push(
      <View
        key={`code-block-end`}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          padding: 10,
          borderRadius: 8,
          marginVertical: 4,
        }}
      >
        <Text style={{ fontFamily: "monospace", color: "#e2e8f0", fontSize: 13 }}>
          {codeBlockBuffer.join("\n")}
        </Text>
      </View>
    );
  }

  return <View style={{ width: "100%" }}>{elements}</View>;
}
