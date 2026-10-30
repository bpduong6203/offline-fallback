// Shared, pure Vietnamese Xì Dách rules. Currency values are actual integer eggs.
export const RULES = Object.freeze({maxPlayers:8, initialBalance:100000, initialFund:10000000, minBet:1000, maxBet:10000, betUnit:1000, playerStand:16, botStand:17, maxCards:5, bettingMs:20000, turnMs:20000, resultMs:8000, botDelayMs:800, dealMs:900, showdownMs:700});
export const HAND_NAMES = ['Quắc', 'Bài thường', 'Ngũ linh', 'Xì dách', 'Xì bàn'];
export function score(cards) {
  let totals = [0];
  for (const {rank} of cards) {
    const values = rank === 1 ? [1,10,11] : [Math.min(rank,10)];
    totals = [...new Set(totals.flatMap(total => values.map(value => total + value)))].sort((a,b)=>a-b);
  }
  const safe = totals.filter(total=>total<=21);
  return {total:safe.length ? safe.at(-1) : totals[0], totals, bust:!safe.length};
}
export function classify(cards) {
  const result = score(cards);
  const kind = result.bust ? 0 : cards.length===2 && cards.every(c=>c.rank===1) ? 4 : cards.length===2 && cards.some(c=>c.rank===1) && cards.some(c=>c.rank>=10) ? 3 : cards.length===5 ? 2 : 1;
  return {...result, kind, name:HAND_NAMES[kind]};
}
export function compare(player, dealer) {
  const p=classify(player), d=classify(dealer);
  if (p.bust) return -1; // A player who busts always loses, including double bust.
  if (p.kind!==d.kind) return Math.sign(p.kind-d.kind);
  if (p.kind>=3) return 0;
  return Math.sign(p.kind===2 ? d.total-p.total : p.total-d.total);
}
export function locked(cards, rules=RULES) {
  const h=classify(cards);
  return h.kind!==1 || h.total===21 || cards.length>=rules.maxCards;
}
// Deliberately receives no deck, opponents, bets or balances.
export function decideBot(cards, rules=RULES) {
  return locked(cards,rules) || score(cards).total>=rules.botStand ? 'stand' : 'hit';
}
export function validateBet(amount, balance, fund, rules=RULES) {
  if (!Number.isSafeInteger(amount) || amount<rules.minBet || amount>rules.maxBet || amount%rules.betUnit!==0) throw new Error('Mức cược phải từ 1.000 đến 10.000 trứng, chia hết cho 1.000.');
  if (amount>balance) throw new Error('Không đủ trứng');
  if (amount>fund) throw new Error('Nhà cái không đủ quỹ cho mức cược này. Vui lòng chọn mức thấp hơn.');
}
export function formatEggs(amount) { return `${amount.toLocaleString('vi-VN')} trứng`; }
export function deck52() { return ['♠','♥','♦','♣'].flatMap(suit=>Array.from({length:13},(_,i)=>({rank:i+1,suit}))); }
export function secureIndex(limit) {
  // Rejection sampling avoids modulo bias; works in Workers and modern Node.
  const ceiling=Math.floor(0x100000000/limit)*limit, buffer=new Uint32Array(1);
  do { crypto.getRandomValues(buffer); } while(buffer[0]>=ceiling);
  return buffer[0]%limit;
}
export function shuffledDeck() {
  const deck=deck52();
  for(let i=deck.length-1;i>0;i--){const j=secureIndex(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}
