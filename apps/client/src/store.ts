import { create } from "zustand";
import type { RoomStateSnapshot, Entity, RoomSummary } from "@protocol";

type State = {
  youId?: string;
  credits: number;
  rooms: RoomSummary[];
  room?: RoomStateSnapshot;
  entities: Record<string, Entity>;
  chat: { fromId:string; message:string; ts:number }[];
  set: (p: Partial<State>) => void;
};

export const useGame = create<State>((set)=>({
  credits: 0,
  rooms: [],
  entities: {},
  chat: [],
  set: (p) => set(p),
}));
