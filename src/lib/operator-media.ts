import type { Operator } from "./types";

export type OperatorMediaType = "image" | "video";

export interface OperatorMedia {
  id: string;
  operatorId: string;
  type: OperatorMediaType;
  url: string;
  storagePath: string;
  alt: string;
  sortOrder: number;
}

export type OperatorWithMedia = Operator & { media: OperatorMedia[] };

export function attachOperatorMedia<T extends Operator>(operators: T[], media: OperatorMedia[]) {
  return operators.map((operator) => ({
    ...operator,
    media: media
      .filter((item) => item.operatorId === operator.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  })) as Array<T & { media: OperatorMedia[] }>;
}
