# 📷 Camera Setup Guide - Sửa lỗi Webcam trên Production

## ⚠️ Vấn đề: Webcam không hoạt động trên Production

Nếu ứng dụng hoạt động tốt trên `localhost` nhưng webcam không bật được khi deploy lên production, đây là **vấn đề về HTTPS**.

---

## 🔍 Nguyên nhân

### 1. **HTTPS là BẮT BUỘC** ⚠️
- Các trình duyệt hiện đại (Chrome, Firefox, Edge, Safari) yêu cầu **HTTPS** để truy cập webcam
- API `navigator.mediaDevices.getUserMedia()` chỉ hoạt động trên:
  - ✅ `https://` URLs
  - ✅ `localhost` (exception)
  - ❌ `http://` (bị chặn)

### 2. **Permissions Policy**
- Production site cần có HTTPS headers đúng cách
- Browser sẽ từ chối quyền truy cập camera nếu không có HTTPS

### 3. **Mixed Content Blocking**
- Nếu trang chạy HTTPS nhưng load resources từ HTTP → bị chặn

---

## ✅ Giải pháp

### Option 1: Deploy với HTTPS (Recommended)

Sử dụng các platform có HTTPS tự động:

#### **1. Vercel** (Khuyến nghị - Miễn phí)
```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Ưu điểm:**
- ✅ HTTPS tự động
- ✅ SSL certificates miễn phí
- ✅ CI/CD tích hợp sẵn
- ✅ Custom domain support

#### **2. Netlify** (Miễn phí)
```bash
# Cài đặt Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Ưu điểm:**
- ✅ HTTPS tự động
- ✅ Free SSL
- ✅ Easy setup
- ✅ Form handling

#### **3. GitHub Pages** (Miễn phí)
```bash
# Build
npm run build

# Deploy (sử dụng gh-pages package)
npm install -g gh-pages
gh-pages -d dist
```

**Lưu ý:** GitHub Pages tự động có HTTPS cho `*.github.io` domains

#### **4. Cloudflare Pages** (Miễn phí)
- Kết nối với GitHub repo
- Auto deploy khi push code
- HTTPS tự động

---

### Option 2: Local Testing với HTTPS

Nếu muốn test HTTPS trên localhost:

#### **Sử dụng Vite với HTTPS**

1. Cài đặt `@vitejs/plugin-basic-ssl`:
```bash
npm install --save-dev @vitejs/plugin-basic-ssl
```

2. Cập nhật `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

export default defineConfig({
  server: {
    https: true,
    host: '::',
    port: 8080,
  },
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

3. Chạy:
```bash
npm run dev
```

Truy cập: `https://localhost:8080` (chấp nhận self-signed certificate)

---

## 🛠️ Các cải tiến đã thực hiện

### 1. **Kiểm tra Secure Context**
Code đã được cập nhật để kiểm tra HTTPS:

```typescript
// Kiểm tra nếu đang chạy trên HTTPS hoặc localhost
const isSecureContext = window.isSecureContext;
if (!isSecureContext) {
  throw new Error(
    'Camera access requires HTTPS. Please deploy with HTTPS enabled.'
  );
}
```

### 2. **Error Messages chi tiết**
Code hiện cung cấp thông báo lỗi cụ thể:

- ✅ **NotAllowedError**: User từ chối quyền truy cập
- ✅ **NotFoundError**: Không tìm thấy camera
- ✅ **NotReadableError**: Camera đang được sử dụng bởi app khác
- ✅ **SecurityError**: Thiếu HTTPS
- ✅ **OverconstrainedError**: Camera không support settings

### 3. **Fallback tốt hơn**
Nếu camera không khả dụng:
- ⌨️ Tự động chuyển sang **Keyboard Mode**
- 🎮 User vẫn có thể chơi game bằng phím `SPACE` hoặc `↑`

---

## 📋 Checklist Deploy Production

Trước khi deploy, đảm bảo:

- [ ] ✅ Deploy lên platform có HTTPS (Vercel/Netlify/GitHub Pages)
- [ ] ✅ Verify site có SSL certificate (icon ổ khóa trên browser)
- [ ] ✅ Test trên nhiều browsers (Chrome, Firefox, Safari, Edge)
- [ ] ✅ Test trên mobile devices
- [ ] ✅ Kiểm tra camera permissions trong browser settings
- [ ] ✅ Verify không có mixed content warnings

---

## 🧪 Testing Camera Access

### Test 1: Kiểm tra HTTPS
```javascript
// Mở browser console trên site của bạn
console.log('HTTPS:', window.isSecureContext);
// Phải trả về: true
```

### Test 2: Kiểm tra Camera API
```javascript
// Kiểm tra browser support
console.log('Camera API:', !!navigator.mediaDevices);
// Phải trả về: true
```

### Test 3: Request Camera Permission
```javascript
// Test camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(() => console.log('✅ Camera OK'))
  .catch(err => console.error('❌ Camera Error:', err.name, err.message));
```

---

## 🔐 Camera Permissions

### Chrome/Edge
1. Click icon ổ khóa bên trái address bar
2. Kiểm tra "Camera" permission
3. Set thành "Allow"
4. Refresh trang

### Firefox
1. Click icon ổ khóa
2. Click "More information"
3. Go to "Permissions" tab
4. Tìm "Use the Camera"
5. Set thành "Allow"

### Safari
1. Safari Menu → Settings → Websites
2. Click "Camera" ở sidebar
3. Tìm domain của bạn
4. Set thành "Allow"

---

## 🚀 Deploy Commands

### Vercel (Khuyến nghị)
```bash
# First time setup
npm install -g vercel
vercel login

# Deploy
vercel

# Production
vercel --prod
```

### Netlify
```bash
# First time setup
npm install -g netlify-cli
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Build cho tất cả platforms
```bash
# Build production
npm run build

# Preview build locally (với HTTPS nếu cần)
npm run preview
```

---

## ❓ Troubleshooting

### Lỗi: "Camera permission denied"
- ✅ Kiểm tra browser permissions
- ✅ Refresh trang sau khi change permissions
- ✅ Verify HTTPS đang hoạt động

### Lỗi: "Camera already in use"
- ✅ Đóng các tabs/apps khác đang dùng camera
- ✅ Restart browser
- ✅ Check OS camera permissions (Windows/Mac settings)

### Lỗi: "Insecure context"
- ✅ Verify site đang chạy trên HTTPS
- ✅ Check không có mixed content
- ✅ Verify SSL certificate valid

### Camera lag/freezing
- ✅ Reduce video resolution trong code
- ✅ Check CPU usage
- ✅ Close unnecessary browser tabs

---

## 📱 Mobile Support

### iOS Safari
- Yêu cầu iOS 11+ để support getUserMedia
- User phải allow camera permission lần đầu
- Không support PWA mode

### Android Chrome
- Full support cho camera access
- Yêu cầu HTTPS
- Support PWA mode

---

## 💡 Tips

1. **Luôn deploy với HTTPS** - Không có cách nào khác để camera hoạt động trên production
2. **Test sớm và thường xuyên** - Test trên nhiều browsers và devices
3. **Fallback strategy** - Luôn có keyboard controls như backup
4. **Clear error messages** - Giúp users hiểu vấn đề và cách fix
5. **Minimize camera resolution** - 640x480 đủ cho pose detection, tiết kiệm bandwidth

---

## 🎯 Kết luận

**Vấn đề chính: Webcam cần HTTPS để hoạt động trên production.**

**Giải pháp:**
- ✅ Deploy lên Vercel/Netlify/GitHub Pages (tự động có HTTPS)
- ✅ Hoặc setup HTTPS cho server hiện tại
- ✅ Test kỹ trước khi release

**Đã implement:**
- ✅ Error handling tốt hơn
- ✅ Security checks
- ✅ Keyboard fallback
- ✅ User-friendly error messages

---

## 🔗 Resources

- [MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Web Security Context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
- [Camera Access Best Practices](https://web.dev/camera-access/)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)

---

**Nếu vẫn gặp vấn đề, check console errors và verify HTTPS status đầu tiên!**

