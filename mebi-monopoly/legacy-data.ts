export const RULES = { cash:1500, salary:200, bail:50, houses:32, hotels:12, rollMs:60000, manageMs:60000, buyMs:30000, debtMs:120000, bidMs:15000, auctionMs:90000 };
export const COLORS = ['#3B82F6','#F97316','#8B5CF6','#22C55E'];
export const CHARACTERS = ['Mèo phi hành gia','Robot nhỏ','Cáo thám hiểm','Gấu doanh nhân'];
export type Tile = { id:number; name:string; kind:string; price:number; group:number; color:string; rents:number[]; build:number };
const names=['Xuất phát','Hẻm Nắng','Quỹ cộng đồng','Hẻm Mây','Thuế thành phố','Ga Bình Minh','Phố Hoa','Cơ hội','Phố Lá','Phố Gió','Thăm tù','Đường Ngọc','Điện Mebi','Đường San Hô','Đường Hổ Phách','Ga Hoàng Hôn','Vườn Cam','Quỹ cộng đồng','Vườn Đào','Vườn Mơ','Bãi đỗ xe','Đại lộ Sen','Cơ hội','Đại lộ Trúc','Đại lộ Mai','Ga Ngân Hà','Bến Sao','Bến Trăng','Nước Mebi','Bến Mộng','Vào tù','Đảo Ngọc','Đảo Lam','Quỹ cộng đồng','MebiEco','Ga Chân Trời','Cơ hội','Mebisoft','Thuế xa xỉ','MebiFarm'];
const rows:number[][]=[
 [1,60,1,2,10,30,90,160,250],[3,60,1,4,20,60,180,320,450],
 [6,100,2,6,30,90,270,400,550],[8,100,2,6,30,90,270,400,550],[9,120,2,8,40,100,300,450,600],
 [11,140,3,10,50,150,450,625,750],[13,140,3,10,50,150,450,625,750],[14,160,3,12,60,180,500,700,900],
 [16,180,4,14,70,200,550,750,950],[18,180,4,14,70,200,550,750,950],[19,200,4,16,80,220,600,800,1000],
 [21,220,5,18,90,250,700,875,1050],[23,220,5,18,90,250,700,875,1050],[24,240,5,20,100,300,750,925,1100],
 [26,260,6,22,110,330,800,975,1150],[27,260,6,22,110,330,800,975,1150],[29,280,6,24,120,360,850,1025,1200],
 [31,300,7,26,130,390,900,1100,1275],[32,300,7,26,130,390,900,1100,1275],[34,320,7,28,150,450,1000,1200,1400],
 [37,350,8,35,175,500,1100,1300,1500],[39,400,8,50,200,600,1400,1700,2000]];
const bands=['','#a97750','#63c4d7','#d86bac','#eda351','#e16c69','#e4c94e','#57aa83','#577cc2'];
export const BOARD:Tile[]=names.map((name,id)=>{
 const row=rows.find(r=>r[0]===id); const kind=row?'land':[5,15,25,35].includes(id)?'station':[12,28].includes(id)?'utility':[2,17,33].includes(id)?'community':[7,22,36].includes(id)?'chance':id===4||id===38?'tax':id===30?'jail':id===10?'visit':id===20?'parking':'start';
 return {id,name,kind,price:row?row[1]:kind==='station'?200:kind==='utility'?150:0,group:row?.[2]||0,color:bands[row?.[2]||0]||'#e8dfce',rents:row?row.slice(3):[],build:row?Math.ceil(row[2]/2)*50:0};
});
export type Card = {text:string; type:string; value?:number};
export const DECKS:Card[][]=[[
 {text:'Thẻ ra tù miễn phí',type:'free'}, {text:'Sửa chữa: 25.000 trứng/nhà, 100.000 trứng/khách sạn',type:'repair',value:25},
 {text:'Phạt tốc độ 15.000 trứng',type:'cash',value:-15},{text:'Tặng mỗi người 50.000 trứng',type:'each',value:-50},
 {text:'Lùi ba ô',type:'back',value:3},{text:'Đến tiện ích gần nhất, thuê gấp 10 xúc xắc',type:'utility'},
 {text:'Cổ tức 50.000 trứng',type:'cash',value:50},{text:'Đến ga gần nhất, thuê gấp đôi',type:'station'},
 {text:'Đóng góp 15.000 trứng',type:'cash',value:-15},{text:'Đến Ga Bình Minh',type:'move',value:5},
 {text:'Đến MebiFarm',type:'move',value:39},{text:'Đến Đại lộ Mai',type:'move',value:24},
 {text:'Đầu tư đáo hạn 150.000 trứng',type:'cash',value:150},{text:'Đến ga gần nhất, thuê gấp đôi',type:'station'},
 {text:'Đến Đường Ngọc',type:'move',value:11},{text:'Đi thẳng vào tù',type:'jail'}
],[
 {text:'Thẻ ra tù miễn phí',type:'free'},{text:'Giải thưởng 10.000 trứng',type:'cash',value:10},
 {text:'Bán cổ phiếu 50.000 trứng',type:'cash',value:50},{text:'Bảo hiểm đáo hạn 100.000 trứng',type:'cash',value:100},
 {text:'Hoàn thuế 20.000 trứng',type:'cash',value:20},{text:'Quỹ du lịch 100.000 trứng',type:'cash',value:100},
 {text:'Thừa kế 100.000 trứng',type:'cash',value:100},{text:'Tư vấn 25.000 trứng',type:'cash',value:25},
 {text:'Viện phí 100.000 trứng',type:'cash',value:-100},{text:'Ngân hàng thưởng 200.000 trứng',type:'cash',value:200},
 {text:'Học phí 50.000 trứng',type:'cash',value:-50},{text:'Khám bệnh 50.000 trứng',type:'cash',value:-50},
 {text:'Sinh nhật: nhận mỗi người 10.000 trứng',type:'each',value:10},{text:'Trở về Xuất phát',type:'move',value:0},
 {text:'Sửa đường: 40.000 trứng/nhà, 115.000 trứng/khách sạn',type:'repair',value:40},{text:'Đi thẳng vào tù',type:'jail'}
]];
