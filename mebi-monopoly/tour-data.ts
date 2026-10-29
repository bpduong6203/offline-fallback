export const SCHEMA_VERSION=2, RULESET='mebi-tour-v2', TITLE='Tỷ Phú Mebi';
export const RULES={cash:1500,salary:300,bail:200,travel:50,tax:.1,rollMs:60000,choiceMs:30000,manageMs:30000,debtMs:120000,takeoverMultiplier:2,resaleRatio:.5,monopolyMultiplier:2,festivalMultiplier:2,festivalMax:5,festivalTurns:8,maxDoubles:3,islandAttempts:3,hotelLevel:4,firstLapMaxLevel:2,laterLapMaxLevel:3,tripleGroups:3,touristCount:4,matchMs:30*60000,touristRents:[0,25,50,100,200]};
export const COLORS=['#3B82F6','#F97316','#8B5CF6','#22C55E'];
export const CHARACTERS=['Mèo phi hành gia','Robot nhỏ','Cáo thám hiểm','Gấu doanh nhân'];
export const PREMIUM=[{key:'mebisoft',name:'Mebisoft',price:400,asset:'tech'},{key:'mebifarm',name:'Mebifarm',price:360,asset:'farm'},{key:'mebieco',name:'Mebieco',price:320,asset:'eco'}];
export type TileType='city'|'tourist'|'start'|'island'|'festival'|'travel'|'chance'|'tax';
export type Tile={id:number;key:string;name:string;tileType:TileType;groupId:number|null;purchasePrice:number;constructionCosts:number[];rentByLevel:number[];takeoverRules:{allowed:boolean;blockedAtLevel:number;multiplier:number};landmarkAsset:string;boardPosition:{x:number;y:number};side:number;color:string};
const rows:[string,string,TileType,number|null,number,string][]=[
 ['start','Xuất phát','start',null,0,'start'],['ha-giang','Hà Giang','city',1,60,'mountain'],['sa-pa','Sa Pa','city',1,70,'mountain'],['chance-north','May mắn','chance',null,0,'card'],['cat-ba','Cát Bà','tourist',null,200,'beach'],['cao-bang','Cao Bằng','city',2,80,'mountain'],['ninh-binh','Ninh Bình','city',2,90,'pagoda'],['ha-long','Hạ Long','city',2,100,'bay'],
 ['island','Hoang đảo','island',null,0,'island'],['ha-noi','Hà Nội','city',3,120,'pagoda'],['phong-nha','Phong Nha','city',3,130,'mountain'],['chance-central','May mắn','chance',null,0,'card'],['cu-lao-cham','Cù Lao Chàm','tourist',null,200,'beach'],['hue','Huế','city',4,140,'pagoda'],['da-nang','Đà Nẵng','city',4,150,'bridge'],['hoi-an','Hội An','city',4,160,'town'],
 ['festival','Lễ hội Việt','festival',null,0,'festival'],['quy-nhon','Quy Nhơn','city',5,180,'beach'],['nha-trang','Nha Trang','city',5,190,'beach'],['chance-south','May mắn','chance',null,0,'card'],['con-dao','Côn Đảo','tourist',null,200,'beach'],['da-lat','Đà Lạt','city',6,210,'town'],['phan-thiet','Phan Thiết','city',6,230,'beach'],['vung-tau','Vũng Tàu','city',6,250,'tower'],
 ['travel','Du lịch Việt','travel',null,0,'travel'],['can-tho','Cần Thơ','city',7,260,'bay'],['ho-chi-minh','TP. Hồ Chí Minh','city',7,280,'tower'],['mebieco','Mebieco','city',8,320,'eco'],['phu-quoc','Phú Quốc','tourist',null,200,'beach'],['mebifarm','Mebifarm','city',8,360,'farm'],['tax','Quỹ thành phố','tax',null,0,'tax'],['mebisoft','Mebisoft','city',8,400,'tech']
];
export const SIDE_LENGTH=8, GRID_SIZE=SIDE_LENGTH+1;
const bands=['#b8d1e5','#a88adc','#6cb7e2','#ed91ba','#eda94f','#e47775','#dac85b','#62b39d','#7189e3'];
const round=(n:number)=>Math.ceil(n/5)*5;
export const BOARD:Tile[]=rows.map(([key,name,tileType,groupId,price,landmarkAsset],id)=>{
 const boardPosition=id<=SIDE_LENGTH?{x:SIDE_LENGTH-id,y:SIDE_LENGTH}:id<=SIDE_LENGTH*2?{x:0,y:SIDE_LENGTH*2-id}:id<=SIDE_LENGTH*3?{x:id-SIDE_LENGTH*2,y:0}:{x:SIDE_LENGTH,y:id-SIDE_LENGTH*3};
 const premium=PREMIUM.find(p=>p.key===key),purchasePrice=premium?.price??price;
 return {id,key,name:premium?.name??name,tileType,groupId,purchasePrice,constructionCosts:tileType==='city'?[0,round(purchasePrice*.3),round(purchasePrice*.45),round(purchasePrice*.6),round(purchasePrice*1.2)]:[],rentByLevel:tileType==='city'?[round(purchasePrice*.08),round(purchasePrice*.25),round(purchasePrice*.5),purchasePrice,round(purchasePrice*1.8)]:[],takeoverRules:{allowed:tileType==='city',blockedAtLevel:RULES.hotelLevel,multiplier:RULES.takeoverMultiplier},landmarkAsset:premium?.asset??landmarkAsset,boardPosition,side:Math.min(3,Math.floor(id/SIDE_LENGTH)),color:bands[groupId??0]};
});
export const tileByKey=(key:string)=>BOARD.find(t=>t.key===key)!;
export const GROUPS=[...new Set(BOARD.flatMap(t=>t.groupId===null?[]:[t.groupId]))].map(id=>BOARD.filter(t=>t.groupId===id).map(t=>t.id));
export const TOURISTS=BOARD.filter(t=>t.tileType==='tourist').map(t=>t.id);
export const SIDES=[0,1,2,3].map(side=>BOARD.filter(t=>t.side===side&&t.purchasePrice>0).map(t=>t.id));
export const LEVEL_NAMES=['Đất trống','Nhà nhỏ','Biệt thự','Tòa nhà','Khách sạn'];
export type Card={text:string;type:'cash'|'move'|'back'|'island'|'escape'|'repair'|'festival';value?:number;key?:string};
export const CARDS:Card[]=[
 {text:'Khởi nghiệp thành công: nhận 100.000 trứng',type:'cash',value:100},{text:'Quỹ du lịch: nhận 50.000 trứng',type:'cash',value:50},{text:'Chi phí bảo trì: trả 50.000 trứng',type:'cash',value:-50},{text:'Chuyến đi về Xuất phát',type:'move',key:'start'},{text:'Ghé thăm Hà Nội',type:'move',key:'ha-noi'},{text:'Cất cánh đến Mebisoft',type:'move',key:'mebisoft'},{text:'Lùi ba ô',type:'back',value:3},{text:'Trôi dạt tới Hoang đảo',type:'island'},{text:'Thẻ rời đảo miễn phí',type:'escape'},{text:'Sửa chữa: 20.000 trứng mỗi cấp công trình',type:'repair',value:20},{text:'Mở lễ hội tại một thành phố sở hữu',type:'festival'},{text:'Thưởng sáng kiến xanh: nhận 150.000 trứng',type:'cash',value:150}
];
