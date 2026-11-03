export const INGREDIENTS = {
 black:'Trà đen', green:'Trà xanh', jasmine:'Hoa lài', mint:'Bạc hà', lemon:'Chanh', milk:'Sữa', sugar:'Đường', pearl:'Trân châu', syrup:'Syrup đào', cup:'Ly và nắp'
};
export const RECIPES = [
 {id:'classic',name:'Trà sữa truyền thống',tea:'black',milk:true,topping:'none',price:8,day:1,ingredients:{black:1,milk:1,sugar:1,cup:1},steps:['Ủ trà','Thêm sữa','Đường và đá','Lắc','Đóng nắp']},
 {id:'pearl',name:'Trà sữa trân châu đường đen',tea:'black',milk:true,topping:'pearl',price:11,day:1,ingredients:{black:1,milk:1,sugar:1,pearl:1,cup:1},steps:['Ủ trà','Thêm sữa','Đường và đá','Thêm trân châu','Lắc','Đóng nắp']},
 {id:'jasmine',name:'Trà sữa lài',tea:'jasmine',milk:true,topping:'none',price:10,day:2,ingredients:{jasmine:1,milk:1,sugar:1,cup:1},steps:['Ủ trà','Thêm sữa','Đường và đá','Lắc','Đóng nắp']},
 {id:'matcha',name:'Matcha latte',tea:'green',milk:true,topping:'none',price:12,day:4,ingredients:{green:1,milk:1,sugar:1,cup:1},steps:['Ủ trà','Thêm sữa','Đường và đá','Khuấy','Đóng nắp']},
 {id:'peach',name:'Trà đào',tea:'black',milk:false,topping:'syrup',price:11,day:6,ingredients:{black:1,syrup:1,sugar:1,cup:1},steps:['Ủ trà','Thêm syrup','Đường và đá','Khuấy','Đóng nắp']},
 {id:'lemon',name:'Trà chanh',tea:'green',milk:false,topping:'lemon',price:9,day:3,ingredients:{green:1,lemon:1,sugar:1,cup:1},steps:['Ủ trà','Thêm chanh','Đường và đá','Khuấy','Đóng nắp']}
];
export const UPGRADES = {brewer:{name:'Bình ủ trà',cost:30},sealer:{name:'Máy dập nắp',cost:35},fridge:{name:'Tủ lạnh',cost:25},shelf:{name:'Kệ nguyên liệu',cost:20},seats:{name:'Bàn ghế',cost:40},pots:{name:'Chậu trồng',cost:25}};
export const DECOR = {lamp:{name:'Đèn mây',cost:18},rug:{name:'Thảm dệt',cost:16},painting:{name:'Tranh lá trà',cost:20},plant:{name:'Cây cảnh',cost:15},cat:{name:'Mèo bên cửa sổ',cost:30},sign:{name:'Biển hiệu gỗ',cost:22}};
export const DAYS = ['Ngày khai trương','Hương lài đầu ngõ','Một chút chanh xanh','Lá matcha mới','Cơn mưa dịu dàng','Mùa đào chín','Giờ sinh viên','Khách đặt theo nhóm','Lễ hội matcha','Góc nhỏ thân quen'];
export const PEOPLE = [
 {name:'An',group:'Sinh viên',favorite:'classic',line:'Một ly ngọt vừa cho buổi học nhé.',color:'#d8ad93'},
 {name:'Minh',group:'Văn phòng',favorite:'jasmine',line:'Ghé góc nhỏ nghỉ trưa một lát.',color:'#8fa99b'},
 {name:'Bà Linh',group:'Người mê trà',favorite:'matcha',line:'Hương trà hôm nay thơm quá.',color:'#b39fbe'},
 {name:'Bông',group:'Mê topping',favorite:'pearl',line:'Mình thích những viên trân châu mềm.',color:'#d6a7ac'},
 {name:'Hải',group:'Khách quen',favorite:'lemon',line:'Lại là chiếc ghế cạnh cửa sổ của mình.',color:'#a5b4c7'}
];
export const MINI = {brew:'Ủ trà đúng độ',pearls:'Nấu trân châu',shake:'Lắc trà sữa',syrup:'Trang trí mặt ly',clean:'Dọn quán',match:'Ghép nguyên liệu'};
