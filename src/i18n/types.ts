import type { ptBR } from "@/i18n/locales/pt-BR";

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Messages = DeepString<typeof ptBR>;

type Join<A extends string, B extends string> = `${A}.${B}`;

export type MessagePath<T = typeof ptBR> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : Join<K, MessagePath<T[K]>>;
    }[keyof T & string];
