# Blue Wildflower — E-card Portfolio

เว็บไซต์ Portfolio แบบ One-page สำหรับแสดง E-card และการ์ดประเภทต่าง ๆ สร้างด้วย HTML, CSS และ JavaScript แบบไม่ใช้ framework แยกไฟล์เพื่อให้ง่ายต่อการแก้ไข

## ไฟล์หลัก

- `index.html` — โครงสร้างหน้าเว็บ เนื้อหาแต่ละ section และ SEO metadata
- `styles.css` — สี ฟอนต์ Liquid Glass, responsive layout และ animation
- `script.js` — ตัวกรองผลงาน เมนูมือถือ modal, contact/social handling และ event hooks สำหรับ analytics
- `portfolio-data.js` — ข้อมูลผลงานและการตั้งค่าช่องทางติดต่อ/โซเชียล
- `assets/` — ภาพปก SVG สำหรับ demo และองค์ประกอบตกแต่ง

## วิธีเปิดดู

เปิด `index.html` ในเบราว์เซอร์ได้ทันที เว็บไซต์ไม่ต้องติดตั้ง dependencies เพิ่มเติม โดย Google Fonts จะใช้ได้เมื่อเชื่อมต่ออินเทอร์เน็ต หากออฟไลน์จะใช้ฟอนต์สำรองแทน

## วิธีเพิ่มผลงานจริง

1. เปิด `portfolio-data.js`
2. คัดลอก object ของผลงานตัวอย่างหนึ่งรายการ แล้วแก้ `id`, `title`, `subtitle`, `category`, `format`, `styleTags`, `image`, `url`, `demo` และ `alt`
3. วางภาพปกไว้ใน `assets/` และกรอก path เช่น `assets/my-wedding-cover.webp` หรือใช้ URL HTTPS ของภาพที่โฮสต์ไว้แล้ว
4. ใส่ลิงก์ตัวอย่างจริงใน `url` และตั้ง `demo: false` เมื่อทดสอบลิงก์แล้ว
5. หมวดหมู่ที่รองรับ: `wedding`, `printed`, `ordination`, `memorial`

> รายการที่มากับไฟล์นี้เป็นภาพ Design Preview/Mockup สำหรับแสดงหน้าตาเว็บเท่านั้น ไม่ใช่ผลงานลูกค้าจริง ช่อง `url` เว้นว่างโดยตั้งใจ ปุ่มจึงจะแสดงหน้าต่าง Preview แทนการเปิดลิงก์ที่ไม่มีอยู่จริง

## ตั้งค่าช่องทางติดต่อและ Social Media

ใน `portfolio-data.js` ให้ใส่ค่าที่ใช้งานจริงใน `SITE_CONFIG`:

```js
window.SITE_CONFIG = {
  contactUrl: "https://line.me/R/ti/p/@yourbrand",
  contactEmail: "hello@yourdomain.com",
  socials: {
    instagram: "https://www.instagram.com/yourbrand/",
    tiktok: "https://www.tiktok.com/@yourbrand",
    facebook: "https://www.facebook.com/yourbrand"
  },
  analytics: true
};
```

แทนค่าตัวอย่างข้างบนด้วย URL และอีเมลจริงก่อนนำเว็บไซต์ขึ้นใช้งาน หากไม่ตั้งค่าลิงก์ เว็บไซต์จะแสดงข้อความแจ้งเตือนและจะไม่เปิดลิงก์ปลอม

## Analytics

เมื่อ `analytics: true` ระบบจะ dispatch custom event `bluewildflower:analytics` เช่น `open_portfolio_project`, `view_portfolio_preview`, `contact_click` และ `social_click` และจะส่ง `gtag` event ให้อัตโนมัติเมื่อมีการโหลด Google Analytics/gtag ไว้บนเว็บไซต์แล้ว การเชื่อม Analytics จริงต้องเพิ่ม tracking ID และสคริปต์ของผู้ให้บริการเอง

## หมายเหตุด้าน Social Feed

Social cards ตอนนี้เป็นลิงก์สำรองพร้อม artwork ที่ออกแบบไว้ ไม่ได้ฝัง feed อัตโนมัติ เนื่องจาก TikTok, Instagram และ Facebook มีวิธีฝังและข้อกำหนด API แยกกัน สามารถต่อ embed/API ภายหลังโดยไม่ต้องเปลี่ยนโครงสร้างหน้าเว็บส่วนอื่น

## ก่อนเผยแพร่

- แทน Design Preview ทั้งหมดด้วยภาพและ URL ของผลงานจริง หรือเอารายการที่ไม่ใช้ใน `portfolio-data.js` ออก
- ตั้งค่า contact URL, email และ social URLs จริง
- ตรวจสอบว่า URL ผลงานเปิดได้ในแท็บใหม่
- เพิ่ม analytics script / tracking ID หากต้องการ
- ทดสอบด้วย keyboard, Chrome, Safari และอุปกรณ์มือถือจริง
