export const W = 15;
export const H = 13;
export const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
export const key = (x,y) => `${x},${y}`;
export const cell = p => [Math.round(p.x), Math.round(p.y)];
export function makeMap(random = Math.random) {
  return Array.from({length:H}, (_,y) => Array.from({length:W}, (_,x) => {
    if (!x || !y || x===W-1 || y===H-1 || (x%2===0 && y%2===0)) return 1;
    if ((x<=2 || x>=W-3) && (y<=2 || y>=H-3)) return 0;
    return random()<0.68 ? 2 : 0;
  }));
}
export function blast(map, bomb) {
  const cells = [[bomb.x,bomb.y]];
  for (const [dx,dy] of dirs) for (let n=1;n<=bomb.range;n++) {
    const x=bomb.x+dx*n,y=bomb.y+dy*n;
    if (map[y]?.[x]===undefined || map[y][x]===1) break;
    cells.push([x,y]);
    if (map[y][x]===2) break;
  }
  return cells;
}
