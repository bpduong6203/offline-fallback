// Lớp giao diện riêng cho prototype YOU GOT PLAYED.
export const stylePlayed = `    .card[data-w="played"] { max-width: 1040px; }
    .card[data-w="played"] .game { position: relative; padding: 10px; background: #101a36; box-shadow: inset 0 0 0 1px #34465d; }
    .card[data-w="played"] canvas { image-rendering: pixelated; }
    .pg-touch { display: none; }
    @media (max-width: 700px) {
      .card[data-w="played"] { padding: 18px 12px; }
      .card[data-w="played"] .game { padding: 5px; border-radius: 14px; }
      .pg-touch { display: flex; position: absolute; z-index: 3; left: 12px; right: 12px; bottom: 12px; justify-content: space-between; align-items: end; pointer-events: none; }
      .pg-touch-group { display: flex; gap: 8px; }
      .pg-touch button { width: 56px; height: 52px; border: 1px solid rgba(255,255,255,.22); border-radius: 14px; background: rgba(15,26,48,.72); color: #fff3d1; font-size: 1.25rem; font-weight: 800; touch-action: none; pointer-events: auto; }
      .pg-touch button.jump { width: 72px; color: #1a2238; background: #f6d98a; }
    }
`;
