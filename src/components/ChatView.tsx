import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChatMessage } from '@/lib/types';
import { colors, fonts, radius, spacing } from '@/theme';

/** Единый чат-компонент для AI-тренера и нутрициолога */
export function ChatView({
  messages,
  onSend,
  loading,
  placeholder,
  suggestions = [],
  header,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  loading: boolean;
  placeholder: string;
  suggestions?: string[];
  header?: React.ReactNode;
}) {
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const send = (t: string) => {
    const trimmed = t.trim();
    if (!trimmed || loading) return;
    setText('');
    onSend(trimmed);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          <>
            {header}
            {messages.length === 0 && suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <Pressable key={s} style={styles.suggestion} onPress={() => send(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>
              {item.content}
            </Text>
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={[styles.bubble, styles.aiBubble, styles.typing]}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.typingText}>печатает…</Text>
            </View>
          ) : null
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          editable={!loading}
        />
        <Pressable
          onPress={() => send(text)}
          style={[styles.sendBtn, (!text.trim() || loading) && { opacity: 0.4 }]}
          disabled={!text.trim() || loading}
        >
          <Text style={styles.sendText}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.l, gap: spacing.m, paddingBottom: spacing.xl },
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.l,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.accent },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  userText: { color: colors.onAccent, fontFamily: fonts.medium },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  suggestions: { gap: spacing.s, marginBottom: spacing.m },
  suggestion: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.m,
  },
  suggestionText: { fontFamily: fonts.medium, fontSize: 14, color: colors.accent },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.s,
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { fontFamily: fonts.extraBold, fontSize: 20, color: colors.onAccent },
});
