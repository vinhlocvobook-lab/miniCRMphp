# Mini CRM - Hướng Dẫn Sử Dụng

## 1. Đăng Nhập / Đăng Ký

### Đăng ký tài khoản mới
1. Truy cập `http://localhost:8000`
2. Click "Register" 
3. Nhập email và password
4. Click "Create Account"

### Đăng nhập
1. Nhập email và password đã đăng ký
2. Click "Login"

---

## 2. Dashboard

Sau khi đăng nhập, bạn sẽ thấy Dashboard với:
- **Total Clients** - Tổng số khách hàng
- **Total Deals** - Tổng số deals
- **Won Deals** - Số deals đã thắng
- **Win Rate** - Tỷ lệ thắng (%)

Biểu đồ thể hiện số deals theo từng giai đoạn.

---

## 3. Quản Lý Khách Hàng (Clients)

### Xem danh sách khách hàng
- Click "Clients" trong sidebar
- Hiển thị danh sách tất cả khách hàng của bạn
- Có ô tìm kiếm để lọc theo tên, email, công ty

### Thêm khách hàng mới
1. Click nút **"+"** hoặc **"Add Client"**
2. Điền thông tin:
   - **Name** (bắt buộc) - Tên khách hàng
   - **Email** - Email khách hàng  
   - **Phone** - Số điện thoại
   - **Company** - Công ty
   - **Address** - Địa chỉ
   - **Notes** - Ghi chú thêm
3. Click "Save"

### Chỉnh sửa khách hàng
1. Click vào khách hàng trong danh sách
2. Click icon **Edit** (bút chì)
3. Sửa thông tin và click "Save"

### Xóa khách hàng
1. Click icon **Delete** (thùng rác)
2. Xác nhận xóa
- **Lưu ý**: Không thể xóa khách hàng đang có deal

---

## 4. Quản Lý Deals (Kanban)

### Kanban Board
Deals được hiển thị dạng Kanban với 5 cột:
- **Lead** (Xanh dương) - Khách hàng tiềm năng mới
- **Contacted** (Vàng) - Đã liên hệ lần đầu
- **Proposal** (Cam) - Đã gửi đề xuất
- **Won** (Xanh lá) - Deal thành công
- **Lost** (Đỏ) - Deal thất bại

### Thêm deal mới
1. Click **"+"** ở góc phải
2. Điều thông tin:
   - **Title** (bắt buộc) - Tên deal
   - **Client** (bắt buộc) - Chọn khách hàng
   - **Value** - Giá trị deal
   - **Stage** - Giai đoạn (mặc định: Lead)
3. Click "Save"

### Di chuyển deal giữa các stage
**Cách 1**: Click vào deal → chọn stage mới từ dropdown

**Cách 2**: Click icon mũi tên xuống bên cạnh deal → chọn stage mới

### Chỉnh sửa deal
1. Click vào deal
2. Click icon **Edit**
3. Sửa thông tin và click "Save"

### Xóa deal
1. Click icon **Delete**
2. Xác nhận xóa

---

## 5. Đăng Xuất

Click **Logout** ở góc phải sidebar để đăng xuất.

---

## Mẹo Sử Dụng

- **Tìm kiếm**: Dùng ô search ở đầu trang Clients để lọc nhanh
- **Toast notifications**: Thông báo hiển thị ở góc phải màn hình
- **Modal**: Các form thêm/sửa hiển thị trong popup modal
- **Keyboard**: Có thể dùng Tab để di chuyển giữa các trường
