import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatView } from '@/components/ChatView';
import { Muted, Title } from '@/components/ui';
import { chatWithCoach } from '@/lib/ai';
import { buildCoachContext } from '@/lib/coachContext';
import { ChatMessage } from '@/lib/types';
import { useApp } from '@/store/AppContext';
import { colors, spacing } from '@/theme';

const SUGGESTIONS = [
  'Что съесть перед тренировкой сегодня?',
  'Составь рацион на день под мою норму',
  'Сколько белка мне сегодня не хватает?',
  'Объясни технику становой тяги',
  'Какие типичные ошибки в жиме лёжа?',
  'Почему не растёт вес в приседе?',
];

export default function Coach() {
  const { profile } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      // AI видит всё: программу, сегодняшнюю тренировку, рацион, норму КБЖУ, рекорды
      const context = await buildCoachContext(profile);
      const reply = await chatWithCoach(next, context);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: `⚠️ ${e instanceof Error ? e.message : 'Сервер недоступен'}\n\nПроверь, что AI-сервер запущен (см. README) и есть интернет.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Title>AI-тренер</Title>
        <Muted>Тренировки и питание — один интеллект, общий контекст</Muted>
      </View>
      <ChatView
        messages={messages}
        onSend={send}
        loading={loading}
        placeholder="Спроси о технике, программе или питании…"
        suggestions={SUGGESTIONS}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.l, paddingTop: spacing.m, gap: 2 },
});
