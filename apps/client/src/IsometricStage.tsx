import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

export type IsoProps = {
  width: number;
  height: number;
  gridW: number;
  gridH: number;
  tiles: number[][];
  entities: { id: string; x: number; y: number; look: string; state: string; }[];
  furniture: { id: string; x: number; y: number; kind: string; rot: number; meta?: any }[];
  onClickCell?: (gx: number, gy: number) => void;
};

function isoToScreen(gx: number, gy: number, tileW = 64, tileH = 32) {
  const x = (gx - gy) * (tileW / 2);
  const y = (gx + gy) * (tileH / 2);
  return { x, y };
}

export default function IsometricStage(props: IsoProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width: props.width,
      height: props.height,
      antialias: false,
      backgroundAlpha: 0,
    });
    appRef.current = app;
    ref.current!.appendChild(app.view as any);

    const stage = new PIXI.Container();
    stage.x = props.width / 2;
    stage.y = 64;
    app.stage.addChild(stage);

    const floor = new PIXI.Container();
    stage.addChild(floor);

    const tileW = 64;
    const tileH = 32;
    for (let y = 0; y < props.gridH; y++) {
      for (let x = 0; x < props.gridW; x++) {
        const g = new PIXI.Graphics();
        const { x: sx, y: sy } = isoToScreen(x, y, tileW, tileH);
        g.lineStyle(1, 0x333333, 0.3);
        g.beginFill(props.tiles[y][x] === 0 ? 0x88ccff : 0x555555, props.tiles[y][x] === 0 ? 0.2 : 0.6);
        g.moveTo(sx, sy);
        g.lineTo(sx + tileW / 2, sy + tileH / 2);
        g.lineTo(sx, sy + tileH);
        g.lineTo(sx - tileW / 2, sy + tileH / 2);
        g.closePath();
        g.endFill();
        floor.addChild(g);
      }
    }

    const furnLayer = new PIXI.Container();
    stage.addChild(furnLayer);
    for (const f of props.furniture) {
      const s = new PIXI.Graphics();
      const { x: sx, y: sy } = isoToScreen(f.x, f.y, tileW, tileH);
      s.beginFill(
        f.kind === "lamp" ? 0xfff200 : f.kind === "chair" ? 0x44aa44 : 0x888888,
        0.9
      );
      s.drawCircle(sx, sy + 8, 8);
      s.endFill();
      furnLayer.addChild(s);
      if (f.kind === "lamp" && f.meta?.on) {
        const glow = new PIXI.Graphics();
        glow.beginFill(0xffffcc, 0.25);
        glow.drawCircle(sx, sy, 26);
        glow.endFill();
        furnLayer.addChild(glow);
      }
    }

    const entLayer = new PIXI.Container();
    stage.addChild(entLayer);
    for (const e of props.entities) {
      const c = new PIXI.Container();
      const { x: sx, y: sy } = isoToScreen(e.x, e.y, tileW, tileH);
      c.x = sx;
      c.y = sy - 12;

      const body = new PIXI.Graphics();
      body.beginFill(0x3366cc);
      body.drawRect(-6, -16, 12, 16);
      body.endFill();
      const head = new PIXI.Graphics();
      head.beginFill(0xffcc99);
      head.drawCircle(0, -20, 6);
      head.endFill();
      c.addChild(body, head);

      entLayer.addChild(c);
    }

    const handler = (e: PIXI.FederatedPointerEvent) => {
      const p = stage.toLocal(e.global);
      const gx = Math.floor((p.y / (tileH / 2) + p.x / (tileW / 2)) / 2);
      const gy = Math.floor((p.y / (tileH / 2) - p.x / (tileW / 2)) / 2);
      if (gx >= 0 && gy >= 0 && gx < props.gridW && gy < props.gridH) {
        props.onClickCell?.(gx, gy);
      }
    };
    app.stage.eventMode = "static";
    app.stage.hitArea = new PIXI.Rectangle(0, 0, props.width, props.height);
    app.stage.on("pointerdown", handler);

    return () => {
      app.destroy(true, { children: true, texture: true, baseTexture: true });
    };
  }, [props.width, props.height, props.gridW, props.gridH, props.tiles, props.entities, props.furniture]);

  return <div ref={ref} className="w-full h-full" />;
}
