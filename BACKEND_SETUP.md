# ตั้งค่าระบบหลังบ้าน CAR CRM

ไฟล์ที่เพิ่ม:

- `admin.html` หน้าเพิ่ม/ลบ/แก้ไขลูกค้า และจองคิว
- `apps-script.gs` หลังบ้านสำหรับเขียนข้อมูลลง Google Sheet

## 1. วาง Apps Script

1. เปิด Google Sheet ที่ใช้กับระบบนี้
2. ไปที่ `Extensions` > `Apps Script`
3. ลบโค้ดตัวอย่างในไฟล์ `Code.gs`
4. นำโค้ดจากไฟล์ `apps-script.gs` ไปวาง
5. เปลี่ยนค่า `API_TOKEN` จาก `CHANGE_THIS_SECRET_TOKEN` เป็นรหัสลับของร้าน เช่น `mhl-2026-admin`
6. กด Save

ตรวจให้แน่ใจว่าท้ายไฟล์มีฟังก์ชัน `jsonResponse()` อยู่ด้วย ถ้าคัดลอกโค้ดไม่ครบ Apps Script จะแจ้ง error ว่า `jsonResponse is not defined`

## 2. Deploy เป็น Web App

1. กด `Deploy` > `New deployment`
2. เลือกชนิดเป็น `Web app`
3. ตั้งค่า `Execute as` เป็น `Me`
4. ตั้งค่า `Who has access` เป็น `Anyone with the link`
5. กด Deploy แล้วคัดลอก Web App URL ที่ลงท้ายด้วย `/exec`

## 3. ตั้งค่าในหน้า Admin

1. เปิด `admin.html`
2. วาง Web App URL
3. ใส่ Token ให้ตรงกับ `API_TOKEN` ใน Apps Script
4. กด `บันทึกการเชื่อมต่อ`
5. กด `โหลดข้อมูล`

## สิ่งที่ทำได้

- ลูกค้า: เพิ่ม / แก้ไข / ลบ / ค้นหา
- จองคิว: เพิ่ม / แก้ไข / ลบ / ค้นหา
- ระบบสร้าง `CustID` และ `JobID` ให้อัตโนมัติถ้าเว้นว่าง
- ข้อมูลที่บันทึกจะกลับไปอยู่ในชีต `Customer` และ `Bookings`

## หมายเหตุ

หน้า Dashboard ยังอ่านข้อมูลจาก Google Sheet เหมือนเดิม หลังบันทึกใน Admin ให้กด `รีเฟรช` ที่ Dashboard เพื่อเห็นข้อมูลล่าสุด
