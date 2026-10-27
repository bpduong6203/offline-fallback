// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const head = (hostname) => `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chờ chút nhé | ${hostname}</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20rx='8'%20fill='%23fff7ed'/%3E%3Cellipse%20cx='13'%20cy='9'%20rx='6'%20ry='3.5'%20fill='%23bae6fd'%20stroke='%237dd3fc'%20transform='rotate(-20%2013%209)'/%3E%3Cellipse%20cx='14'%20cy='18'%20rx='9'%20ry='7.5'%20fill='%23ea580c'%20stroke='%237c2d12'%20stroke-width='1.5'/%3E%3Cpath%20d='M12%2011v14'%20stroke='%237c2d12'%20stroke-width='1'/%3E%3Cg%20fill='%23431407'%3E%3Ccircle%20cx='9'%20cy='16'%20r='1.5'/%3E%3Ccircle%20cx='9'%20cy='21'%20r='1.5'/%3E%3Ccircle%20cx='16'%20cy='15'%20r='1.5'/%3E%3Ccircle%20cx='16'%20cy='21'%20r='1.5'/%3E%3Ccircle%20cx='24'%20cy='17'%20r='4.5'/%3E%3C/g%3E%3Ccircle%20cx='25.5'%20cy='15.5'%20r='1.8'%20fill='%23fff'/%3E%3Ccircle%20cx='26'%20cy='15.5'%20r='.8'%20fill='%23111'/%3E%3Cpath%20d='M25%2013Q27%208%2030%209'%20stroke='%23431407'%20stroke-width='1.2'%20fill='none'%20stroke-linecap='round'/%3E%3C/svg%3E">
  <meta name="theme-color" content="#fff7ed">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
`;
