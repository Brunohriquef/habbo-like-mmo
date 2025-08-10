import type { ClientToServer, ServerToClient, Entity } from "@protocol";
import { useGame } from "./store";

let ws: WebSocket | null = null;

export function connect(){
  ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:8787");
  const set = useGame.getState().set;
  ws.onmessage = (ev)=>{
    const msg = JSON.parse(ev.data) as ServerToClient;
    if(msg.t==="welcome"){
      set({ youId: msg.youId, credits: msg.credits, rooms: msg.rooms });
    }
    if(msg.t==="room_list"){
      set({ rooms: msg.rooms });
    }
    if(msg.t==="room_joined"){
      const ents: Record<string, Entity> = {};
      msg.room.entities.forEach(e=>ents[e.id]=e);
      set({ room: msg.room, entities: ents });
    }
    if(msg.t==="room_left"){
      set({ room: undefined, entities: {} });
    }
    if(msg.t==="entity_joined"){
      const { entities } = useGame.getState();
      entities[msg.entity.id]=msg.entity;
      set({ entities: { ...entities } });
    }
    if(msg.t==="entity_left"){
      const { entities } = useGame.getState();
      delete entities[msg.id];
      set({ entities: { ...entities } });
    }
    if(msg.t==="entity_moved"){
      const { room, entities } = useGame.getState();
      const ent = entities[msg.id]; if(!ent||!room) return;
      const last = msg.path[msg.path.length-1];
      ent.pos = last as any; ent.state = "walk";
      set({ entities: { ...entities } });
    }
    if(msg.t==="chat"){
      const st = useGame.getState();
      set({ chat: [...st.chat, { fromId: msg.fromId, message: msg.message, ts: Date.now() }] });
    }
    if(msg.t==="furniture_placed"){
      const st = useGame.getState();
      if(st.room){
        st.room.furniture.push(msg.item);
        set({ room: { ...st.room } });
      }
    }
  };
}

export function send(msg: ClientToServer){
  ws?.send(JSON.stringify(msg));
}
