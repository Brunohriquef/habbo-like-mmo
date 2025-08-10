import { useEffect, useMemo } from "react";
import { connect, send } from "./net";
import { useGame } from "./store";
import IsometricStage from "./pixi/IsometricStage";

export default function App(){
  const { youId, rooms, room, entities, chat, credits, set } = useGame();

  useEffect(()=>{
    connect();
  }, []);

  useEffect(()=>{
    if(youId){
      send({ t:"hello", name:"Visitante", look:"body:tan;hair:short:#333;top:t:#66C" });
    }
  }, [youId]);

  const ents = useMemo(()=>Object.values(entities).map(e=>({ id:e.id, x:e.pos.x, y:e.pos.y, look:e.look, state:e.state })), [entities]);
  const furniture = useMemo(()=> room?.furniture.map(f=>({ id:f.id, x:f.at.x, y:f.at.y, kind:f.kind, rot:f.rot, meta:f.meta })) ?? [], [room]);

  return (
    <div className="w-screen h-screen grid md:grid-cols-[320px_1fr] grid-rows-1">
      {/* Sidebar */}
      <aside className="p-3 border-r border-zinc-200 flex flex-col gap-3 overflow-auto bg-white">
        <div className="text-xl font-semibold">Hotel</div>
        <div className="text-sm">Créditos: <b>{credits}</b></div>
        <div className="mt-2">
          <div className="text-sm font-medium mb-1">Salas públicas</div>
          <div className="flex flex-col gap-2">
            {rooms.map(r=>(
              <button key={r.id}
                className={`px-3 py-2 rounded border text-left hover:bg-zinc-50 ${room?.id===r.id?'border-blue-400':'border-zinc-200'}`}
                onClick={()=> send({ t:"enter_room", roomId: r.id })}>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-zinc-500">{r.users} online</div>
              </button>
            ))}
          </div>
        </div>

        {room && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-1">Ações da Sala</div>
            <div className="flex gap-2">
              <button className="px-3 py-2 text-sm border rounded" onClick={()=> send({ t:"leave_room" })}>Sair</button>
              <button className="px-3 py-2 text-sm border rounded" onClick={()=>{
                // coloca cadeira demo
                send({ t:"place_furniture", defId:"chair_basic", at:{x:8,y:8}, rot:0 });
              }}>Colocar cadeira</button>
              <button className="px-3 py-2 text-sm border rounded" onClick={()=>{
                send({ t:"place_furniture", defId:"lamp_basic", at:{x:9,y:8}, rot:0 });
              }}>Colocar lamp</button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="relative">
        {room ? (
          <>
            <IsometricStage
              width={window.innerWidth-320}
              height={window.innerHeight-200}
              gridW={room.size.w}
              gridH={room.size.h}
              tiles={room.tiles}
              furniture={furniture}
              entities={ents}
              onClickCell={(gx,gy)=> send({ t:"click_move", target:{x:gx,y:gy} })}
            />
            {/* Chat */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/85 border-t p-2 flex gap-2">
              <input
                id="chatInput"
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="Diga algo..."
                onKeyDown={(e)=>{
                  if(e.key==="Enter"){
                    const v = (e.target as HTMLInputElement).value.trim();
                    if(v){ send({ t:"chat", message: v }); (e.target as HTMLInputElement).value=""; }
                  }
                }}
              />
              <button className="px-3 py-1 border rounded text-sm" onClick={()=>{
                const inp = document.getElementById("chatInput") as HTMLInputElement;
                const v = inp.value.trim(); if(!v) return;
                send({ t:"chat", message: v }); inp.value="";
              }}>Enviar</button>
            </div>

            {/* Balões de fala (HTML overlay simplificado) */}
            <div className="pointer-events-none absolute inset-0"></div>
            <div className="absolute top-2 right-2 bg-white/90 border rounded p-2 w-80 h-48 overflow-auto text-sm">
              {chat.slice(-50).map((m,i)=>(
                <div key={i}><b>{m.fromId===youId?'Você':m.fromId.slice(0,5)}:</b> {m.message}</div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full grid place-items-center text-zinc-500">
            <div>Entre em uma sala para começar 🎈</div>
          </div>
        )}
      </main>
    </div>
  );
}
