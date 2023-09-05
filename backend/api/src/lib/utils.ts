import { ChatCompletionMessage, ChatCompletionChunk } from 'openai/resources/chat';

export const messageReducer = (
  previous: ChatCompletionMessage,
  item: ChatCompletionChunk
): ChatCompletionMessage => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reduce = (acc: any, delta: any) => {
    acc = { ...acc };
    for (const [key, value] of Object.entries(delta)) {
      if (acc[key] === undefined || acc[key] === null) {
        acc[key] = value;
      } else if (typeof acc[key] === 'string' && typeof value === 'string') {
        (acc[key] as string) += value;
      } else if (typeof acc[key] === 'object' && !Array.isArray(acc[key])) {
        acc[key] = reduce(acc[key], value);
      }
    }
    return acc;
  };

  return reduce(previous, item.choices[0].delta) as ChatCompletionMessage;
};
