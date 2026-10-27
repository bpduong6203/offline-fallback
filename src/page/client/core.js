// Một đoạn của script phía trình duyệt, được nối lại theo thứ tự trong render.js (cùng một phạm vi).
// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const clientCore = `  <script>
  (function () {
    var W = 480, H = 270;
    var c = document.getElementById('g');
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var x = c.getContext('2d');
    function setSize(w, h) { c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    setSize(W, H);
    var tm = 0;

`;
