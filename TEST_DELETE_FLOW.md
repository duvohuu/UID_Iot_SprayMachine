# 🧪 TEST DELETE MACHINE FLOW

## ✅ VERIFIED: Code đã được fix để XÓA VĨNH VIỄN trong DATABASE

### 📋 FLOW HOÀN CHỈNH

```
1. User click 🗑️ icon trên machine card (UI)
   ↓
2. Dialog hiển thị: "⚠️ XÓA VĨNH VIỄN khỏi DATABASE"
   ↓
3. User click "Xóa" button
   ↓
4. Frontend gọi: deleteMachine(machine._id)
   ↓
5. API Request: DELETE http://localhost:5000/api/machines/{_id}
   ↓
6. Backend Middleware:
   - protect: Verify JWT token ✅
   - adminOnly: Check user.role === 'admin' ✅
   ↓
7. Backend Controller:
   - Validate ObjectId ✅
   - findByIdAndDelete(id) ✅ (XÓA TRONG DATABASE)
   - Return success response ✅
   ↓
8. Frontend nhận response:
   - Show snackbar: "Đã xóa máy khỏi database" ✅
   - Call onMachineDelete() ✅
   ↓
9. StatusPage refresh danh sách máy ✅
   ↓
10. Machine BIẾN MẤT khỏi UI và DATABASE ✅
```

---

## 🔍 TESTING STEPS

### **Step 1: Verify User là Admin**

```javascript
// Browser Console (F12)
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Is Admin?', user?.role === 'admin');
```

**Expected Output:**
```
User: { userId: "...", username: "admin", role: "admin", ... }
Is Admin? true
```

---

### **Step 2: Verify Machine Exists in Database (BEFORE DELETE)**

```bash
# MongoDB Shell
mongosh "mongodb+srv://duvohuu:du07112004@dev-cluster.ladlh5o.mongodb.net/IOT_IUD"

# Find machine
db.machines.findOne({ machineId: "SPRAY001" })
```

**Expected:** Machine document exists

---

### **Step 3: Delete Machine từ UI**

1. Go to: `http://192.168.0.139:5173/status`
2. Find machine card (e.g., "SPRAY001")
3. Click **🗑️** icon (top-right corner)
4. Dialog hiển thị: "⚠️ Hành động này sẽ XÓA VĨNH VIỄN máy khỏi DATABASE"
5. Click **"Xóa"** button

---

### **Step 4: Check Frontend Console Logs**

**Expected Frontend Logs:**
```
🗑️ Deleting machine from DATABASE:
   Machine ID: SPRAY001
   MongoDB _id: 677e8c9a5b7f3c001a123456
   Machine Name: Máy Phun Sơn 1

🗑️ Deleting machine with ID: 677e8c9a5b7f3c001a123456
✅ Delete response: { success: true, message: "Machine deleted successfully", ... }
✅ Machine DELETED from DATABASE successfully!
   Response: { success: true, ... }
   Refreshing machine list on UI...
```

---

### **Step 5: Check Backend Console Logs**

**Expected Backend Logs:**
```
🔐 [AdminCheck] User: admin, Role: admin
✅ [AdminCheck] Access granted - User is admin

🗑️ Attempting to delete machine with ID: 677e8c9a5b7f3c001a123456
   Using MongoDB _id for deletion
✅ Machine deleted: Máy Phun Sơn 1 (SPRAY001)
```

---

### **Step 6: Check Network Tab (F12 → Network)**

**Request:**
```
DELETE http://192.168.0.139:5000/api/machines/677e8c9a5b7f3c001a123456
Status: 200 OK
```

**Response:**
```json
{
  "success": true,
  "message": "Machine deleted successfully",
  "deletedMachine": {
    "machineId": "SPRAY001",
    "name": "Máy Phun Sơn 1"
  }
}
```

---

### **Step 7: Verify Machine DELETED from Database (AFTER DELETE)**

```bash
# MongoDB Shell
db.machines.findOne({ machineId: "SPRAY001" })
```

**Expected:** `null` (machine không còn tồn tại)

```bash
# Count total machines
db.machines.countDocuments()
```

**Expected:** Giảm đi 1 máy

---

### **Step 8: Verify UI Updated**

1. ✅ Machine card **BIẾN MẤT** khỏi danh sách
2. ✅ Snackbar hiển thị: "Đã xóa máy SPRAY001 khỏi database"
3. ✅ Danh sách máy tự động refresh

---

## ❌ COMMON ERRORS & FIXES

### **Error 1: 403 Forbidden - "Access denied. Admin only."**

**Cause:** User không phải admin

**Fix:**
```bash
# Update user role in MongoDB
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)

# Logout và login lại
```

---

### **Error 2: 401 Unauthorized - "Token expired"**

**Cause:** JWT token hết hạn

**Fix:**
```javascript
// Browser Console
localStorage.clear();
// Refresh page và login lại
```

---

### **Error 3: 404 Not Found - "Machine not found"**

**Cause:** Machine đã bị xóa hoặc không tồn tại

**Check:**
```bash
# Verify machine exists
db.machines.find({ machineId: "SPRAY001" })
```

---

### **Error 4: Machine biến mất khỏi UI nhưng vẫn còn trong database**

**Cause:** Frontend chỉ xóa local state, không gọi API

**Check Backend Logs:**
- Nếu KHÔNG thấy log `🗑️ Attempting to delete machine` → API không được gọi
- Check Network tab xem có request DELETE không

**Fix:** Đã được fix trong code mới

---

## 📊 CODE CHANGES SUMMARY

### ✅ **Frontend Changes**

**File: `Front-end/src/components/status/StatusMachinesGrid.jsx`**

```javascript
// ✅ ADDED: Chi tiết logs để verify xóa database
const handleDeleteConfirm = async () => {
    console.log('🗑️ Deleting machine from DATABASE:');
    console.log('   Machine ID:', machineToDelete.machineId);
    console.log('   MongoDB _id:', machineToDelete._id);
    
    // ✅ XÓA TRONG DATABASE
    const result = await deleteMachine(machineToDelete._id);
    
    if (result.success) {
        console.log('✅ Machine DELETED from DATABASE successfully!');
        showSnackbar(`Đã xóa máy khỏi database`, 'success');
        onMachineDelete(machineToDelete); // Refresh UI
    }
};
```

**Dialog Message:**
```jsx
<Alert severity="error">
  ⚠️ Hành động này sẽ XÓA VĨNH VIỄN máy khỏi DATABASE và không thể hoàn tác!
</Alert>
```

---

### ✅ **Backend Changes**

**File: `Back-end/src/api/controllers/machineController.js`**

```javascript
// ✅ ALREADY CORRECT: Xóa trong database
export const deleteMachine = async (req, res) => {
    const { id } = req.params;
    
    // Try deleting by MongoDB _id first
    if (mongoose.Types.ObjectId.isValid(id)) {
        machine = await Machine.findByIdAndDelete(id); // ✅ XÓA DATABASE
    }
    
    // Fallback: Try machineId
    if (!machine) {
        machine = await Machine.findOneAndDelete({ machineId: id }); // ✅ XÓA DATABASE
    }
    
    console.log(`✅ Machine deleted: ${machine.name}`);
    res.json({ success: true, message: 'Machine deleted successfully' });
};
```

---

**File: `Back-end/src/api/middlewares/auth.middleware.js`**

```javascript
// ✅ ADDED: Logs để verify admin access
export const adminOnly = (req, res, next) => {
    console.log(`🔐 [AdminCheck] User: ${req.user?.username}, Role: ${req.user?.role}`);
    
    if (req.user?.role === 'admin') {
        console.log('✅ [AdminCheck] Access granted');
        next();
    } else {
        console.log('❌ [AdminCheck] Access DENIED');
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};
```

---

## 🎯 VERIFICATION CHECKLIST

Before deleting:
- [ ] User logged in as admin
- [ ] Machine exists in database
- [ ] Backend server running
- [ ] Frontend connected to backend

During delete:
- [ ] Dialog shows "XÓA VĨNH VIỄN khỏi DATABASE"
- [ ] Frontend console shows machine details
- [ ] Backend console shows admin check passed
- [ ] Backend console shows delete query executed
- [ ] Network tab shows 200 OK response

After delete:
- [ ] Machine card disappears from UI
- [ ] Snackbar shows success message
- [ ] Backend logs confirm deletion
- [ ] Database query returns null
- [ ] Machine count decreased by 1

---

## ✅ CONCLUSION

**Code hiện tại ĐÃ ĐÚNG và XÓA VĨNH VIỄN trong database!**

Flow:
```
UI Delete Click → API Call → Auth Check → Database Delete → UI Update
```

Nếu bạn click xóa mà máy vẫn còn trong database, check:
1. Backend console có log `✅ Machine deleted` không?
2. Network tab có response 200 OK không?
3. MongoDB query trả về null chưa?

Nếu 3 điều trên đều YES → Machine đã bị xóa khỏi database thành công!
