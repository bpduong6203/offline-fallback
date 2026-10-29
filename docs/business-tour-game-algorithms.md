# BUSINESS TOUR–STYLE WEB GAME — GAMEPLAY & ALGORITHM SPECIFICATION

**Version:** 1.0 (29/10/2026)  
**Deliverable:** Đặc tả thuật toán / luật vận hành cho Headless Web Game Engine  
**Scope:** Gameplay, state machine, thuật toán, cấu hình, tests. **Không bao gồm UI, đồ họa, hệ thống thanh toán hay mã nguồn gốc của Business Tour.**  
**Technology suggested:** TypeScript, runtime Node.js, engine độc lập với framework.

> **Độ chính xác:** Đây là **thiết kế tái hiện trải nghiệm chơi tương tự** dựa vào mô tả chính thức và các hướng dẫn cộng đồng công khai. Không phải thuật toán hoặc mã nguồn được 8Floor công bố. Để tránh đánh đồng thông tin, ký hiệu: **[A]** = được kênh chính thức xác nhận ở cấp tính năng; **[B]** = hướng dẫn cộng đồng/nguồn thứ cấp ghi nhận, cần kiểm tra bằng gameplay thực tế theo phiên bản; **[C]** = quyết định **đề xuất** để xây dựng game mới và có thể chỉnh được qua config.

---

## 1. Tổng quan và phạm vi

### 1.1. Những tính năng quan sát được ở Business Tour

- **[A]** 2–4 người online; 2v2; offline với bot; chơi cùng bạn bè; bảng xếp hạng; tournament.
- **[A]** Tung xúc xắc, mua tài sản, thu tiền thuê, thương lượng với đối thủ, nâng cấp và các sự kiện may rủi; có Map Editor và **table seed** để tái phát chuỗi sự kiện ngẫu nhiên trên bản mobile được mô tả năm 2026.
- **[B]** Các điều kiện thắng được hướng dẫn cộng đồng nêu: **Side Monopoly, Triple Monopoly, Resort Monopoly, Bankruptcy**; nếu toàn bộ đối thủ rời trận thì có **Accept Winnings**.
- **[B]** Các ô đặc biệt từng được mô tả: Start, Resort, Chance, Lost Island, World Championship, World Tour, Tax Agency; có lễ hội/tăng tiền thuê, động đất và các thẻ tác động đến công trình.
- **[B]** Người chơi được báo cáo bắt đầu với **2.000.000** tiền trận; một số hướng dẫn ghi **START +300.000**, **World Tour 50.000**, **Lost Island phí thoát 200.000** và **thuế 10%**. Đây **không phải thông số chính thức cố định cho mọi bản đồ/chế độ/phiên bản**.

### 1.2. Mục tiêu game riêng

Giữ lõi trải nghiệm: mỗi lượt tung xúc xắc → di chuyển → mua/xây/nâng cấp tài sản → thu hoặc trả phí → giành độc quyền → thắng ngay khi đạt bộ thắng hoặc khi đối phương phá sản. Tất cả giá trị, vị trí ô, số ô, nhóm ô và chế độ thắng nên **data-driven**. Không sao chép hình ảnh, thương hiệu hay tài nguyên độc quyền của Business Tour.

### 1.3. Phạm vi bản đầu (MVP)

**Bao gồm:** Room 2–4 người, 2 xúc xắc, vòng lặp lượt, mua/xây nhà, level nâng cấp, khách sạn, mua lại khi được phép, tiền thuê, tax, resort, Chance, island, world tour, world championship/festival, nhóm monopoly, thắng tức thời, phá sản, rời trận, bot, log/replay.  
**Chưa cần:** đấu giải có thưởng, marketplace, monetization, xếp hạng toàn cầu, cosmetics, UI, đấu 2v2 hoàn chỉnh (dành extension).

---

## 2. Luật chơi dành cho người chơi

1. Vào phòng 2–4 người, chọn chế độ/map; mỗi người nhận tiền ban đầu (**2.000.000** là preset tham khảo **[B]**).
2. Hệ thống chọn thứ tự người chơi; bắt đầu trên ô START.
3. Trong lượt, người chơi tung **hai xúc xắc**; đi theo tổng số bước trên vòng bàn cờ. Tổng từ 2–12; tổng 7 có xác suất cao nhất 6/36.
4. Khi **đi ngang START** theo di chuyển bình thường, nhận thưởng START theo map (**300.000** là preset tham khảo **[B]**). Di chuyển tức thời cần luật riêng, không mặc nhiên nhận thưởng.
5. Đến **thành phố trống**, có thể mua/xây theo bảng giá hiện hành hoặc bỏ qua. Phiên bản mô phỏng cho phép chọn mức xây ban đầu 1 hay 2 nhà nếu đủ tiền (**[B]**). Trên **thành phố mình sở hữu**, có thể nâng cấp theo luật quay lại ô và giới hạn cấp.
6. Đến **thành phố của người khác**, trả tiền thuê; có thể có tùy chọn mua lại nếu điều kiện/cấu hình cho phép, nhưng **khách sạn và tài sản được bảo vệ không thể mua lại** theo cách diễn giải từ hướng dẫn **[B]**.
7. Đến **Resort**, mua nếu chưa có chủ, trả phí nếu của người khác; không mua lại resort của đối thủ theo hướng dẫn **[B]**.
8. Các ô đặc biệt có tác dụng tức thời hoặc mở quyết định: Chance, Lost Island, World Tour, World Championship, Tax.
9. Khi không đủ tiền trả phí: vào luồng xử lý nợ; thanh lý các phần có thể thanh lý hoặc phá sản tùy rule set. Không cho số dư âm.
10. Trận kết thúc ngay khi một người thỏa **Side Monopoly**, **Triple Monopoly**, **Resort Monopoly**, hoặc chỉ còn một người chưa phá sản/forfeit. Nếu tất cả người khác rời trận, xét **Accept Winnings**.

**Điểm cần xác minh trực tiếp:** mức xây tối đa trước khách sạn, cơ chế mua lại/chi phí mua lại, kết quả tung đôi, luật đảo/thoát tù, thời điểm tăng tiền thuê từ sự kiện, hiệu ứng thẻ và các con số theo map. Không cố khẳng định các chi tiết này giống 100% Business Tour.

---

## 3. Game configuration (không hardcode luật)

```ts
type Money = number; // integer safe range; currency nội bộ trận

type Rules = {
  minPlayers: 2;
  maxPlayers: 4;
  initialCash: Money;             // preset 2_000_000 [B]
  startPassBonus: Money;          // preset 300_000 [B]
  diceCount: 2;
  diceSides: 6;
  decisionTimeoutMs: number;      // [C] 30_000
  rollTimeoutMs: number;          // [C] 30_000
  maxHouseLevel: number;          // [C] 3 trước khách sạn
  hotelLevel: number;             // [C] 4
  initialBuildChoices: number[];  // [C] [1,2]
  taxRateBps: number;             // [B] 1000 = 10%
  islandEscapeFee: Money;         // [B] 200_000
  islandMaxFailedTurns: number;   // [C] 3
  worldTourFee: Money;           // [B] 50_000
  doubleExtraTurn: boolean;      // [C] false tới khi xác minh
  threeDoublesToIsland: boolean; // [C] false tới khi xác minh
  buybackEnabled: boolean;       // [C] true
  buybackMultiplierBps: number;  // [C] 20000 = 2.0x
  victory: {
    side: boolean;
    tripleSetsRequired: number;   // [C] 3
    allResorts: boolean;
    bankruptcy: boolean;
    allOthersLeave: boolean;
  };
};
```

**Map schema:** danh sách `Tile` theo thứ tự vòng; `sideId` cho từng cạnh; `setId` và `patternId` cho bộ màu/hoạ tiết; `resortIds`; `property price`, `buildCosts`, `rentTable`, `buybackPolicy`; `eventDeck`; `festivalRules`; `upgradeRules`. Độ dài board **do map quyết định**, không mặc định 32 hay 40.

### 3.1. Các loại ô

| Tile type | Xử lý khi dừng | Nguồn |
|---|---|---|
| `START` | Có thể nhận thưởng nếu quy tắc đi qua/đến START thỏa | [B] |
| `CITY` | Đất trống: mua/xây; của mình: nâng cấp; của đối thủ: trả thuê/mua lại | [B] |
| `RESORT` | Mua/trả phí; tập hợp đủ các resort kích hoạt thắng | [B] |
| `CHANCE` | Rút thẻ hoặc mở quyền dùng vật phẩm | [B] |
| `LOST_ISLAND` | Vào trạng thái giam/skip lượt cho đến khi thoát | [B] |
| `WORLD_TOUR` | Trả phí và chọn nơi di chuyển được phép | [B] |
| `WORLD_CHAMPIONSHIP` | Kích hoạt/chọn thành phố tổ chức sự kiện thưởng thuê | [B] |
| `TAX_AGENCY` | Thuế theo định nghĩa map (ví dụ 10% tiền hiện có) | [B] |
| `REST/OTHER` | Không hiệu ứng hoặc hiệu ứng do map định nghĩa | [C] |

---

## 4. State Model

```ts
type Phase =
  | 'LOBBY' | 'TURN_START' | 'AWAIT_ROLL' | 'ISLAND_DECISION'
  | 'ROLL_RESOLVED' | 'AWAIT_CITY_DECISION' | 'AWAIT_BUYBACK'
  | 'AWAIT_WORLD_TOUR_TARGET' | 'AWAIT_EVENT_TARGET'
  | 'DEBT_RESOLUTION' | 'TURN_END' | 'FINISHED';

type PlayerState = {
  id: string; seat: number; teamId?: string;
  cash: Money; position: number; lapsCompleted: number;
  bankrupt: boolean; forfeited: boolean; connected: boolean;
  islandFailedTurns: number; isOnIsland: boolean;
  inventory: string[];
};

type AssetState = {
  tileId: string; ownerId: string | null;
  level: number; // 0 = không nhà, 1..3 = nhà, 4 = hotel [C]
  shieldCharges: number;
  disabledUntilStartPasses: number;
  rentModifierBps: number;
};

type PendingDebt = {
  id: string; debtorId: string;
  creditorId: string | null; amount: Money; paid: boolean;
  sourceEventId: string;
};

type GameState = {
  matchId: string; rulesetVersion: string; mapVersion: string;
  phase: Phase; round: number; currentSeat: number;
  players: PlayerState[];
  assets: Record<string, AssetState>;
  pendingDebt?: PendingDebt;
  pendingDecision?: Record<string, unknown>;
  activeFestival?: { cityId: string; multiplierBps: number; untilRound: number };
  diceDoublesStreak: number;
  eventSeq: number; version: number;
  winners: string[]; winReason?: string;
  rngStateOrSeedRef: string;
};
```

**Bất biến:** tiền là integer không âm; 1 ô chỉ có 0 hoặc 1 chủ; cấp công trình không vượt giới hạn; chỉ người có lượt được thực hiện lệnh; đang nợ không thể mua/xây/roll; hành động chỉ áp dụng đúng phase; match finished là immutable.

---

## 5. Thuật toán điều phối tổng (Finite State Machine)

```text
LOBBY -> đủ người / ready -> TURN_START
TURN_START -> nếu trên đảo: ISLAND_DECISION; ngược lại: AWAIT_ROLL
AWAIT_ROLL -> ROLL_DICE -> ROLL_RESOLVED
ROLL_RESOLVED -> MOVE -> RESOLVE_TILE
RESOLVE_TILE ->
  CITY unowned             -> AWAIT_CITY_DECISION
  CITY owned by self       -> AWAIT_CITY_DECISION (upgrade / done)
  CITY owned by opponent   -> PAY_RENT -> [DEBT_RESOLUTION] / AWAIT_BUYBACK / TURN_END
  RESORT                   -> buy/pay -> [DEBT_RESOLUTION] / TURN_END
  CHANCE                   -> APPLY_EVENT -> [AWAIT_EVENT_TARGET] / [DEBT_RESOLUTION] / TURN_END
  WORLD_TOUR               -> AWAIT_WORLD_TOUR_TARGET -> RESOLVE_DESTINATION
  WORLD_CHAMPIONSHIP       -> AWAIT_EVENT_TARGET -> TURN_END
  LOST_ISLAND              -> MARK_ISLAND -> TURN_END
  TAX                      -> PAY_TAX -> [DEBT_RESOLUTION] / TURN_END
  START/REST               -> TURN_END
AWAIT_CITY_DECISION -> BUY | BUILD | UPGRADE | SKIP -> CHECK_VICTORY -> TURN_END
DEBT_RESOLUTION -> LIQUIDATE | PAY | BANKRUPT -> CHECK_VICTORY -> TURN_END
TURN_END -> CHECK_VICTORY -> next active seat -> TURN_START
FINISHED -> Reject commands
```

Một `TURN_END` chỉ được commit **một lần**. Với `AWAIT_*` cần deadline, default action do engine quy định; ví dụ bỏ mua hoặc từ chối World Tour khi hết giờ.

---

## 6. Chi tiết thuật toán

### ALG-01 — Khởi tạo trận / thứ tự lượt

**Input:** participants, mapId, rulesetId, seed/config. **Output:** `GameState`.  
1. Kiểm tra 2–4 player khác ID. 2. Load và validate map (start, island, sets, resorts, giá, bảng thuê). 3. Seed RNG/khởi tạo random transcript. 4. Shuffle ghế chơi theo server. 5. Gán tiền ban đầu, vị trí START, chưa sở hữu tài sản. 6. Game bắt đầu và log `MATCH_STARTED`.

### ALG-02 — Tung xúc xắc và di chuyển

- Sinh **2 số đồng đều 1..6** bằng RNG từ **server**; không nhận số từ client.
- `steps = d1 + d2`.
- `newIndex = (oldIndex + steps) % board.length`.
- `passesStart = floor((oldIndex + steps) / board.length)` đối với di chuyển xuôi bình thường; cộng bonus đúng số lần theo luật (với 2 xúc xắc và board thông thường là 0 hoặc 1).
- Tách `moveMode` thành `DICE`, `TELEPORT`, `CARD_MOVE`, `GO_TO_START`; **chỉ `DICE` được mặc định nhận thưởng qua START**. Các move mode còn lại có cờ `awardStartBonus` cấu hình.
- Nếu 2 viên bằng nhau, phát `DOUBLES_ROLLED`; **không tự động cho lượt thêm hoặc gửi đảo** trước khi bật rule cụ thể.

```ts
function rollAndMove(oldPos: number, boardSize: number, d1: number, d2: number) {
  if (boardSize <= 0 || ![d1, d2].every(v => Number.isInteger(v) && v >= 1 && v <= 6))
    throw new Error('Invalid dice or board');
  const absolute = oldPos + d1 + d2;
  return { newPos: absolute % boardSize, startPasses: Math.floor(absolute / boardSize), isDouble: d1 === d2 };
}
```

### ALG-03 — Tile Resolver

```ts
switch (tile.type) {
  case 'CITY': return resolveCity(state, tile);
  case 'RESORT': return resolveResort(state, tile);
  case 'CHANCE': return drawAndApplyCard(state);
  case 'LOST_ISLAND': return sendToIsland(state);
  case 'WORLD_TOUR': return offerWorldTour(state);
  case 'WORLD_CHAMPIONSHIP': return offerChampionship(state);
  case 'TAX_AGENCY': return createTaxDebt(state);
  case 'START': case 'REST': return endTurn(state);
}
```

`resolveCity` không được tự kết thúc lượt nếu còn lựa chọn mua hoặc xử lý nợ. Giới hạn số lần chained card/move trong một action để tránh vòng lặp vô tận (ví dụ max 8 effect hops **[C]**).

### ALG-04 — Mua thành phố và xây ban đầu

**Điều kiện:** ô chưa có chủ; đúng phase/turn; số tiền đủ; level khởi tạo hợp lệ.  
**Cách vận hành tương tự nguồn cộng đồng [B]:** lần đầu ghé ô có thể chọn 1 hoặc 2 nhà trong giới hạn thanh toán.  
**[C]** `cost = landPrice + sum(buildCost[level=1..initialLevel])`; cấp/giá chính xác nằm trong config; trả toàn bộ trong một transaction; chuyển chủ sở hữu và level; phát `CITY_ACQUIRED` + `BUILDING_CONSTRUCTED`; gọi `checkVictory` ngay.

**Không được:** 2 lệnh mua cùng thành phố cùng thành công; mua lúc đang nợ; mua tài sản khác mà không phải nơi nhân vật đứng (trừ World Tour).

### ALG-05 — Nâng cấp và xây khách sạn

**[B]** hướng dẫn mô tả cần quay lại thành phố sau một vòng để lên level 3 và về sau nâng thành khách sạn; khách sạn miễn tác động động đất và không bị mua lại. Hướng dẫn cộng đồng khác đề cập 4 cấp phát triển — **chưa thống nhất cách đếm**.

**[C] Chuẩn hóa:** `level 0` đất trống, `1..3` nhà, `4` khách sạn. Cho nâng cấp **chỉ khi nhân vật đáp đúng ô mình sở hữu** và `lapsCompleted > asset.lastUpgradeLap` (nếu bật `requireNewLapToUpgrade`). Nếu đủ tiền, trừ tiền, tăng cấp tối đa 1 mỗi lần ghé; cấp 4 `isHotel=true`. Không cho nâng cấp khi `disabled` nếu rule set quy định.

### ALG-06 — Tiền thuê

**Ưu tiên bảng thuê** theo `(tileId, level)`; không áp đặt hệ số level nếu không có bằng chứng.  
**[C]** nếu cần công thức tạm:

```text
rawRent = rentTable[level]
finalRent = floor(rawRent * festivalBps/10000 * championshipBps/10000 * otherBps/10000)
```

Nếu miễn phí do bảo vệ/hiệu ứng, `finalRent = 0`; khi `finalRent > 0`, tạo đúng một nghĩa vụ nợ. Thu tiền **chỉ sau khi xác định người trả đủ hoặc đã thanh lý**. Không trừ người trả trước rồi cộng chủ sở hữu hai lần.

### ALG-07 — Mua lại thành phố của người khác

**[B]** một số mô tả cho biết ô thành phố đối thủ có thể mua lại; khách sạn và resort không bị mua lại. Không có đủ thông tin công khai xác minh **mọi điều kiện, công thức, thứ tự trả phí rồi mua lại**.

**[C] Rule đề xuất:** nếu bật `buybackEnabled`, thành phố không có hotel/shield và người đến ô đủ tiền:
1. Tạo nghĩa vụ `rent` trước và giải quyết hoặc nhánh mua lại theo `buybackRentPolicy`.
2. Giá mua lại = `floor((landPrice + investedBuildCost) * buybackMultiplierBps / 10000)`; ví dụ 2x, chỉ là preset **[C]**.
3. Trừ người mua, cộng chủ cũ, chuyển quyền sở hữu, reset/giữ level theo `buybackPreserveLevel`.
4. Kiểm tra thắng sau ownership transfer.

Đặc tả phải cố định có cộng thêm tiền thuê hay không trước khi cho phép mua lại để tránh tranh chấp.

### ALG-08 — Resort

- Nếu chưa có chủ → offer `BUY_RESORT`; nếu thuộc đối thủ → thu phí.
- Không cho buyback resort (**[B]**).
- Sau khi mua, kiểm tra `allResortsOwnedBy(playerId)`; nếu toàn bộ resort map thuộc một player → `RESORT_MONOPOLY`.
- Số resort **4** là preset của bản đồ thường được hướng dẫn cộng đồng mô tả **[B]**; động cơ thuật toán không cần hardcode 4.

### ALG-09 — Tax Agency

**[B]** thuế 10% được nhắc trong hướng dẫn, nhưng cơ sở tính cần xác minh. **[C]** dùng `tax = floor(player.cash * taxRateBps / 10000)` tại thời điểm đáp ô; 10% = 1000 basis points. Không dùng tổng tài sản trừ khi map quy định khác. Thuế trả về ngân hàng (`creditorId=null`).

### ALG-10 — Lost Island

**[B]** người chơi bị giữ lượt; các nguồn thứ cấp nêu trả 200.000, tung đôi hoặc hết 3 lần thử. **[C]** khi vào đảo:
1. `isOnIsland=true; islandFailedTurns=0` và end turn.
2. Đầu lượt: lựa chọn `PAY_ESCAPE_FEE`, `USE_ESCAPE_CARD` hoặc `TRY_DOUBLE`.
3. `TRY_DOUBLE`: server gieo 2 viên; nếu đôi thì thoát và **[C]** di chuyển luôn bằng số đã tung; không đôi thì tăng `islandFailedTurns`, bỏ lượt.
4. Sau 3 lần thất bại, tự thoát ở lần bắt đầu lượt kế tiếp (**[C]**; có thể chỉnh).
5. Trường hợp thiếu tiền phí, card đã tiêu thụ và ra đảo cùng lúc phải được unit test.

### ALG-11 — World Tour

**[B]** người chơi có thể trả khoảng 50.000 để chọn một thành phố chưa có chủ hoặc đất của chính mình. **[C]** server tạo `eligibleTargets`, đưa danh sách cho client; chỉ chấp nhận ID có trong danh sách; trừ phí trước khi teleport; move mode `TELEPORT` không thưởng START; sau khi đến gọi `resolveTile` **một lần** và dùng giới hạn effect hops.

### ALG-12 — World Championship / Festival

**[B]** có cơ chế chọn thành phố để tổ chức giải/tăng tiền thuê; một số mô tả ghi trước lượt có thành phố xảy ra festival. **[C]** định nghĩa `RentEvent {cityId, multiplierBps, startTurn, expiresTurn, stackPolicy}`. World Championship cho phép chọn thành phố hợp lệ; festival có thể random trước vòng. Tính tiền thuê tại thời điểm người khác đáp ô; hết hạn thì tự xóa. Khuyến nghị `stackPolicy=MAX` thay vì nhân dồn vô hạn.

### ALG-13 — Chance & thẻ sự kiện

**[B]** các dạng thẻ được ghi nhận trong hướng dẫn gồm: đến START, đến đảo, phá/hạ cấp nhà đối thủ, động đất, tăng tiền thuê một thành phố, sinh nhật (nhận tiền từ người khác), đi World Tour, chống phá/mua lại, mất điện (vô hiệu thành phố), thoát đảo. **Tỷ lệ xuất hiện và tác động chính xác không công khai/không xác minh.**

**[C]** biểu diễn dưới dạng effect declarative thay vì if-else theo từng thẻ:

```ts
type CardEffect =
  | { type: 'CREDIT'; amount: number; from: 'BANK' | 'OTHER_PLAYERS' }
  | { type: 'DEBIT'; amount: number; to: 'BANK' | 'OTHER_PLAYER' }
  | { type: 'TELEPORT'; target: 'START' | 'ISLAND' | 'SELECTED_TILE' }
  | { type: 'DOWNGRADE'; target: 'SELECT_OPPONENT_CITY'; steps: number }
  | { type: 'EARTHQUAKE'; selector: 'ALL_UNPROTECTED_CITIES' }
  | { type: 'SHIELD'; charges: number }
  | { type: 'DISABLE_RENT'; durationStartPasses: number }
  | { type: 'FESTIVAL'; multiplierBps: number; durationTurns: number }
  | { type: 'ESCAPE_ISLAND_CARD' };
```

- Draw theo `weightedDeck` có RNG server và lịch sử rút có thể replay.
- Card chọn target phải tạo phase `AWAIT_EVENT_TARGET`; chỉ target hợp lệ.
- `EARTHQUAKE`: **[C]** hạ cấp hoặc bỏ quyền sở hữu các ô không phải hotel/chưa có shield theo config; không tuyên bố đây là thuật toán chính thức.
- `SHIELD`: chặn phá/mua lại theo số charge.
- `DISABLE_RENT`: thời gian vô hiệu được đếm theo số lần qua START của chủ đất nếu chọn kiểu này.
- Money từ các người chơi khác sinh các nghĩa vụ độc lập; xử lý theo thứ tự ghế để tránh deadlock.

### ALG-14 — Tiền, nợ và phá sản

- `transfer(from, to, amount, reasonId)` là thao tác **atomic + idempotent**. `amount >= 0` và integer.
- Khi đủ tiền: trừ người trả, cộng chủ nợ nếu có; nếu thuế nộp ngân hàng, chỉ trừ người trả.
- Khi thiếu tiền: chuyển `DEBT_RESOLUTION`, cấm mọi action trừ `SELL_ASSET`, `MORTGAGE` (nếu bật), `SETTLE`, `DECLARE_BANKRUPTCY`.
- **[C]** thanh lý theo `liquidationValueTable` và thứ tự do người chơi chọn, không tự tạo tiền. Nếu vẫn không đủ nguồn lực → bankruptcy; chuyển/thu hồi tài sản theo `bankruptcyAssetPolicy` được định nghĩa rõ. Một debt ID không thể thanh toán hai lần.
- Nếu đối thủ rời trận, chính sách `[C]` là `FORFEIT` (không phải thanh toán tiền thuê); kiểm tra winner khi chỉ còn một active player.

### ALG-15 — Kiểm tra chiến thắng **ngay sau mọi thay đổi quyền sở hữu**

Nguồn hướng dẫn Steam community xác định 5 kiểu kết thúc: `SIDE_MONOPOLY`, `TRIPLE_MONOPOLY`, `RESORT_MONOPOLY`, `BANKRUPTCY`, `ACCEPT_WINNINGS` **[B]**.

1. **Side Monopoly:** `sideId` ánh xạ các ô có thể sở hữu trên **một cạnh** bản đồ; tất cả phải có cùng `ownerId`. Không được để `START`/`TAX` làm điều kiện không thể đạt: lọc theo `sideWinEligible=true` (**[C]**).
2. **Triple Monopoly:** mỗi `tripletId` gồm đúng 3 ô (theo pattern map); nếu một người sở hữu cả 3 → cộng 1 completeTriplet. Khi `completeTripletCount >= tripleSetsRequired` (preset 3) thì thắng. **Khác với chỉ 3 ô bất kỳ**.
3. **Resort Monopoly:** sở hữu toàn bộ `resortIds` của map.
4. **Bankruptcy:** còn đúng 1 player active chưa bị bankrupt/forfeit.
5. **Accept Winnings:** nếu tất cả người khác rời trận và rules cho phép, người còn lại thắng.

```ts
function checkVictory(s: GameState, map: MapConfig, rules: Rules): WinResult | null {
  const active = s.players.filter(p => !p.bankrupt && !p.forfeited);
  for (const p of active) {
    if (rules.victory.side && map.sides.some(side =>
      side.winTileIds.length > 0 && side.winTileIds.every(id => s.assets[id]?.ownerId === p.id)))
      return { winnerId: p.id, reason: 'SIDE_MONOPOLY' };

    const tripleCount = map.triplets.filter(group =>
      group.tileIds.length === 3 && group.tileIds.every(id => s.assets[id]?.ownerId === p.id)).length;
    if (tripleCount >= rules.victory.tripleSetsRequired)
      return { winnerId: p.id, reason: 'TRIPLE_MONOPOLY' };

    if (rules.victory.allResorts && map.resortIds.length && map.resortIds.every(id => s.assets[id]?.ownerId === p.id))
      return { winnerId: p.id, reason: 'RESORT_MONOPOLY' };
  }
  if (active.length === 1) return {
    winnerId: active[0].id,
    reason: s.players.some(p => p.forfeited) ? 'ACCEPT_WINNINGS' : 'BANKRUPTCY'
  };
  return null;
}
```

> **Ghi chú code:** Đây là pseudocode sử dụng `MapConfig`, `WinResult` được định nghĩa trong module tương ứng. Cần phân biệt `BANKRUPTCY` với `FORFEIT` nếu cả hai loại loại trừ cùng xuất hiện; đồng thời chỉ kích hoạt từng kiểu thắng khi `rules.victory` cho phép.

### ALG-16 — Bot decision making

**[C]** Bot không được đọc xúc xắc tương lai. Chỉ nhận state/public information y như người chơi. Chọn hành động dựa trên:

```text
scoreBuy = expectedRentIncome(15 turns)
         + expectedMonopolyBonus
         + denialValueAgainstOpponent
         - purchaseCost
         - expectedLiquidityRisk
```

Dùng mô phỏng Monte Carlo để ước lượng xác suất đáp ô; bot trả phí, mua, nâng cấp, dùng card. Có 3 difficulty presets: random-valid / heuristic / rollout. Bot phải tuân theo cùng `validateCommand` như người thật.

---

## 7. Reducer, Commands & Events

**Command contract (không gửi dice result từ client):**

```ts
type Command =
  | { type: 'ROLL_DICE' }
  | { type: 'BUY_CITY'; tileId: string; initialLevel: 1 | 2 }
  | { type: 'SKIP_PURCHASE' }
  | { type: 'UPGRADE_CITY'; tileId: string }
  | { type: 'BUYBACK_CITY'; tileId: string }
  | { type: 'BUY_RESORT'; tileId: string }
  | { type: 'PAY_ISLAND_FEE' }
  | { type: 'ROLL_TO_ESCAPE' }
  | { type: 'USE_CARD'; cardId: string; targetId?: string }
  | { type: 'SELECT_TRAVEL_TARGET'; tileId: string }
  | { type: 'SELECT_EVENT_TARGET'; tileId: string }
  | { type: 'LIQUIDATE_ASSET'; tileId: string }
  | { type: 'SETTLE_DEBT' }
  | { type: 'END_TURN' }
  | { type: 'FORFEIT' };

type CommandEnvelope = {
  commandId: string; matchId: string; actorId: string;
  expectedVersion: number; command: Command;
};

type EngineResult = { nextState: GameState; events: DomainEvent[] };
```

`process(state, envelope, deps)`: (1) validate turn/phase/expectedVersion; (2) check commandId duplicate; (3) apply command với RNG injected; (4) auto resolve side effects; (5) check victory; (6) assert invariants; (7) persist state + events **atomically**; (8) broadcast events/snapshot. Khi retry cùng `commandId`, trả kết quả trước đó, không replay transaction. Mỗi room chỉ có **một writer** đồng thời.

Events gợi ý: `MATCH_STARTED`, `TURN_STARTED`, `DICE_ROLLED`, `PLAYER_MOVED`, `START_BONUS_GRANTED`, `CITY_PURCHASED`, `CITY_UPGRADED`, `PROPERTY_BOUGHT_BACK`, `RENT_CHARGED`, `MONEY_TRANSFERRED`, `DEBT_OPENED`, `DEBT_SETTLED`, `PLAYER_BANKRUPT`, `CARD_DRAWN`, `CARD_RESOLVED`, `ISLAND_ENTERED`, `ISLAND_EXITED`, `RESORT_PURCHASED`, `FESTIVAL_STARTED`, `WIN_CONDITION_MET`, `MATCH_FINISHED`.

---

## 8. Simulation và chống gian lận

- **Random:** server sử dụng RNG được kiểm soát; lưu `seed` và **cursor/event transcript** để replay. Nếu dùng seeded deterministic PRNG để debug, không lộ seed tương lai cho đối thủ trong live match; public replay sau trận. Table seed tái hiện chuỗi ngẫu nhiên là tính năng được mô tả trên App Store, **không có nghĩa thuật toán RNG gốc được công bố**.
- **Authoritative server:** client chỉ gửi intent, không gửi số tiền, vị trí, tỷ lệ thuê, ownership, random card.
- **Idempotency:** mỗi action có commandId, seq, expectedVersion và transaction log; chống double-click/network retry.
- **Reconnection:** người chơi lấy snapshot + events kể từ lastSeq; timeout tự áp dụng quyết định mặc định an toàn.
- **Rate limiting:** không nhận spam commands; không cho roll trong phase khác; validate asset target trong danh sách hợp lệ.
- **Simulations:** chạy 10.000–100.000 trận bot vs bot với các seed khác nhau; thống kê tỉ lệ thắng seat 1–4, tỉ lệ thắng bằng Side/Triple/Resort/Bankruptcy, tổng vòng, cashflow, tần suất thẻ, tỉ lệ đảo, ROI từng tài sản.

---

## 9. Bảng test cần triển khai

| Test ID | Tình huống | Kỳ vọng |
|---|---|---|
| T01 | 2–4 players, duplicate ID | Reject duplicate/ngoài phạm vi |
| T02 | 2 xúc xắc 1–6 | Không bao giờ ngoài phạm vi |
| T03 | Đi qua START bằng DICE | Cộng đúng bonus và đúng một lần |
| T04 | Teleport qua START | Không thưởng nếu không có flag |
| T05 | Mua thành phố vừa đủ tiền | Cash = 0; owner cập nhật |
| T06 | Hai người cùng submit mua | Chỉ một command thành công |
| T07 | Nâng cấp sai chủ/không đủ tiền | Reject, state không đổi |
| T08 | City hotel bị buyback | Reject |
| T09 | Protected asset nhận earthquake | Không thay đổi nếu shield chặn |
| T10 | Rent có festival/championship | Tính đúng multiplier/rounding |
| T11 | Thuế 10% cash | Trừ đúng theo integer rounding |
| T12 | Đảo trả phí và tung đôi | Chỉ thoát theo phase/luật |
| T13 | World Tour chọn target không hợp lệ | Reject |
| T14 | Chance kéo theo teleport → tile | Resolve một lần, không loop vô hạn |
| T15 | Chuyển tiền thành công | Tổng tiền người chơi bảo toàn nếu bank không tham gia |
| T16 | Không đủ tiền thanh toán | `DEBT_RESOLUTION`, không cash âm |
| T17 | Cùng debt/command retry | Không thu 2 lần |
| T18 | Sở hữu cả một cạnh | Side Monopoly thắng ngay |
| T19 | Sở hữu 3 triplets hợp lệ | Triple Monopoly thắng ngay |
| T20 | Sở hữu toàn bộ resorts | Resort Monopoly thắng ngay |
| T21 | Mọi đối thủ bankrupt | Bankruptcy win |
| T22 | Mọi đối thủ forfeit | Accept Winnings win |
| T23 | Replay từ seed & command log | Trùng state cuối |
| T24 | Timeout / reconnect | Không tạo thêm lượt/nhân đôi tiền |
| T25 | 100k simulation matches | Không deadlock; invariants luôn đúng |

---

## 10. Thứ tự triển khai (không cần UI)

| Ưu tiên | Module | Output |
|---|---|---|
| P0 | `rules/` + `maps/` | JSON schemas + map validation |
| P0 | `state/` + `commands/` + `reducer/` | Engine deterministic và snapshot |
| P0 | `turn/` + `dice/` + `movement/` | Di chuyển/START/lượt |
| P0 | `property/` + `economy/` + `rent/` | Mua, thuê, nâng cấp, mua lại |
| P0 | `victory/` | 5 điều kiện thắng |
| P1 | `tiles/` | Resort, Tax, Island, World Tour, Championship |
| P1 | `events/` | Chance, earthquake, shield, festival |
| P1 | `debt/` | Thanh lý, phá sản |
| P1 | `bots/` + `simulator/` | Kiểm thử game tự động |
| P2 | `transport/` | WebSocket/SignalR khi bắt đầu làm multiplayer UI |

**Repository đề xuất**

```text
web-board-game/
  packages/
    game-engine/
      src/{state,rules,commands,reducer,algorithms,events,validation}
      tests/
    game-maps/
      standard-map.json
      rules-v1.json
    game-simulator/
      src/{bots,runner,metrics,cli}
  docs/
    business-tour-game-algorithms.md
```

**Definition of Done cho Headless MVP:** tạo room, cho 4 bot tự chơi từ đầu tới kết thúc; replay 1 trận theo command log/seed; không vi phạm invariants; kiểm tra được tất cả điều kiện thắng trên unit tests; không cần rendering.

---

## 11. Những vấn đề phải chốt trước khi gọi là “giống 100% Business Tour”

1. Chính xác tổng số ô, vị trí ô, nhóm `sideId`, `tripletId`, thành phố và resort của **bản đồ/chế độ mục tiêu**.
2. Bảng giá mua, giá nâng cấp và giá thuê ở từng level của mỗi ô.
3. Các level nhà: 2 nhà lần đầu, cấp 3 sau vòng mới, khách sạn tại lần ghé tiếp theo — cùng cách game thực sự đếm cấp.
4. Mua lại: có bắt buộc trả thuê trước không, giá mua lại, giữ level hay reset, điều kiện miễn mua lại.
5. Cách xử lý tung đôi, đảo, thời điểm START reward khi teleport/card.
6. Chance deck hoàn chỉnh, tỷ lệ, thứ tự tác động shield/earthquake/disable và cách hết hạn festival.
7. Side Monopoly có bao gồm các ô không thể mua không; triple nào hợp lệ, ưu tiên khi nhiều điều kiện thắng cùng lúc.
8. Khác biệt luật giữa classic, 2v2, tournament, bản đồ tự tạo và tùy chọn gadgets.

**Đề xuất:** dùng tài liệu này như **Ruleset v1 – Business-Tour-inspired**. Nếu cần tái hiện chính xác từng con số và hành vi, hãy quay/chụp gameplay của map mục tiêu rồi làm một bảng test đối chiếu với engine; không thể suy ngược thuật toán gốc chỉ từ thông tin công khai.

---

## 12. Nguồn đối chiếu (truy cập 29/10/2026)

**Chính thức**

1. Steam store – 8Floor, multiplayer và các tính năng: https://store.steampowered.com/app/397900/Business_Tour/
2. App Store – 8Floor Asia, cơ chế properties, map editor và table seeds: https://apps.apple.com/vn/app/business-tour/id1468486788
3. Epic Games Store FAQ – mô tả auctions, chance, upgrades: https://store.epicgames.com/p/business-tour-board-game-with-online-multiplayer-faq-27319a

**Hướng dẫn / nguồn thứ cấp (không phải luật máy chính thức)**

4. Steam Community – Win Conditions: https://steamcommunity.com/sharedfiles/filedetails/?id=2709808229
5. Steam Community – Starter Guide: https://steamcommunity.com/sharedfiles/filedetails/?id=2510294679
6. Download.vn – Cách chơi, Start, Lost Island, Resort, Tax, World Tour: https://download.vn/huong-dan-cach-choi-business-tour-cho-nguoi-moi-bat-dau-50333
7. FPT Shop – Cách chơi, level nhà, festival, đặc tính khách sạn: https://fptshop.com.vn/tin-tuc/giai-tri/cach-choi-game-business-tour-202851
8. FPT Shop – Quy luật và thẻ Chance: https://fptshop.com.vn/tin-tuc/giai-tri/game-business-tour-noi-lam-giau-cua-nhung-ty-phu-tuong-lai-167909

**Lưu ý:** một số bài viết cộng đồng không thống nhất về quy tắc phát triển nhà/khách sạn hoặc mua lại. Hãy coi những điểm này là **mức xác nhận B** và thay đổi được bằng `Rules`.
