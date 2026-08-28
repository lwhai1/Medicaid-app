import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ 请在此处替换为您在 Firebase 申请到的真实 Key 配置
const firebaseConfig = {
    apiKey: "AIzaSyAFReJ8q3PnNDY41A4dRvHMj-LcWbPx4P0",
    authDomain: "sunshine-insurance-54216.firebaseapp.com",
    projectId: "sunshine-insurance-54216",
    storageBucket: "sunshine-insurance-54216.firebasestorage.app",
    messagingSenderId: "482845933926",
    appId: "1:482845933926:web:187e2c11b1ffae34afc8a7",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 多语言字典定义 (i18n)
const i18nData = {
    zh: {
        adminPortal: "管理员后台",
        mainTitle: "美福阳光保险信息采集系统",
        subTitle: "Medicare & Medicaid 会员年度保险更新云端服务平台",
        searchTitle: "☁️ 档案调取与检索",
        searchDesc: "输入会员姓名或电话号码，直接从云端服务器调取历史档案，避免重复输入。",
        searchPlaceholder: "输入姓名或电话号码...",
        btnSearch: "调取档案",
        btnReset: "清空/新建",
        sec1Title: "一、 会员基本信息",
        lblFullName: "会员姓名 *",
        lblDL: "驾照号 / State ID *",
        lblPhone: "电话号码 *",
        lblZip: "邮政编码 (ZIP Code) *",
        lblAddress: "家庭详细住址 *",
        sec2Title: "二、 原有保险及医疗需求",
        lblInsurance: "原医疗保险公司及卡号",
        phInsurance: "例如: UnitedHealthcare / ID...",
        lblAppt: "预约保险代理沟通时间",
        lblMeds: "常用药品清单",
        phMeds: "请列出日常服用的药物名称及剂量...",
        lblDoctors: "常看的医生 / 医疗机构",
        phDoctors: "请列出希望保留的家庭医生或专科医生姓名/诊所...",
        lblNotes: "其他特殊需求或备注",
        btnSubmit: "☁️ 保存至服务器并生成纸质报告",
        adminLoginTitle: "管理员身份验证",
        lblAdminPwd: "管理员密码",
        btnLogin: "登录后台",
        adminDashTitle: "会员档案管理后台",
        adminDashDesc: "实时调取全量提交数据，支持一键导出 Excel / CSV 报表",
        btnLogout: "退出登录"
    },
    en: {
        adminPortal: "Admin Portal",
        mainTitle: "Sunshine Insurance Information System",
        subTitle: "Medicare & Medicaid Member Annual Enrollment Cloud Platform",
        searchTitle: "☁️ Search & Retrieve Cloud Record",
        searchDesc: "Enter member name or phone to fetch existing records from cloud.",
        searchPlaceholder: "Enter full name or phone number...",
        btnSearch: "Search Record",
        btnReset: "Reset/New",
        sec1Title: "1. Basic Member Information",
        lblFullName: "Full Name *",
        lblDL: "Driver's License / State ID *",
        lblPhone: "Phone Number *",
        lblZip: "ZIP Code *",
        lblAddress: "Home Address *",
        sec2Title: "2. Existing Insurance & Medical Needs",
        lblInsurance: "Current Insurance Provider & ID",
        phInsurance: "e.g., UnitedHealthcare / Member ID...",
        lblAppt: "Appointment Time with Agent",
        lblMeds: "Current Medications",
        phMeds: "List daily medications and dosages...",
        lblDoctors: "Preferred Doctors / Clinics",
        phDoctors: "List primary care physicians or specialists...",
        lblNotes: "Special Needs / Notes",
        btnSubmit: "☁️ Save to Cloud & Print Report",
        adminLoginTitle: "Admin Authentication",
        lblAdminPwd: "Admin Password",
        btnLogin: "Login",
        adminDashTitle: "Member Records Management",
        adminDashDesc: "Manage full record submissions with Excel / CSV export capabilities.",
        btnLogout: "Logout"
    }
};

let currentLang = 'zh';
let rawCloudData = []; // 用于导出的数据缓存

// 多语言切换功能
window.toggleLanguage = function() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    document.getElementById('langToggleBtn').innerText = currentLang === 'zh' ? 'English' : '中文';
    
    // 渲染文本
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData[currentLang][key]) {
            el.innerText = i18nData[currentLang][key];
        }
    });
    // 渲染 Placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18nData[currentLang][key]) {
            el.placeholder = i18nData[currentLang][key];
        }
    });
};

// 提交数据并打印
window.saveToCloudAndPrint = async function(event) {
    event.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerText = currentLang === 'zh' ? '正在上传服务器...' : 'Uploading...';

    const docId = document.getElementById('docId').value;
    const record = {
        fullName: document.getElementById('fullName').value.trim(),
        dlNumber: document.getElementById('dlNumber').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        address: document.getElementById('address').value.trim(),
        currentInsurance: document.getElementById('currentInsurance').value.trim(),
        appointmentTime: document.getElementById('appointmentTime').value,
        medications: document.getElementById('medications').value.trim(),
        doctors: document.getElementById('doctors').value.trim(),
        notes: document.getElementById('notes').value.trim(),
        updatedAt: new Date().toLocaleString()
    };

    try {
        if (docId) {
            await updateDoc(doc(db, "medicaid_members", docId), record);
        } else {
            const docRef = await addDoc(collection(db, "medicaid_members"), record);
            document.getElementById('docId').value = docRef.id;
        }

        alert(currentLang === 'zh' ? '✅ 数据已成功同步保存至服务器！正在准备打印报告...' : '✅ Saved to cloud! Preparing print report...');
        window.print();
    } catch (error) {
        console.error("Save error:", error);
        alert('❌ Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = i18nData[currentLang].btnSubmit;
    }
};

// 单人云端检索
window.searchCloudRecord = async function() {
    const queryStr = document.getElementById('searchInput').value.trim();
    if (!queryStr) return alert(currentLang === 'zh' ? '请输入姓名或电话号码进行云端检索' : 'Please enter Name or Phone');

    try {
        const membersRef = collection(db, "medicaid_members");
        let q = query(membersRef, where("phone", "==", queryStr));
        let querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            q = query(membersRef, where("fullName", "==", queryStr));
            querySnapshot = await getDocs(q);
        }

        if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            populateFormFields(docData.id, docData.data());
            alert(currentLang === 'zh' ? `✅ 已成功从服务器调取 [${docData.data().fullName}] 的档案！` : `✅ Record fetched for [${docData.data().fullName}]!`);
        } else {
            alert(currentLang === 'zh' ? '云端数据库中未找到匹配的会员记录。' : 'No records found.');
        }
    } catch (error) {
        alert('Fetch error: ' + error.message);
    }
};

// 重置表单
window.resetForm = function() {
    document.getElementById('infoForm').reset();
    document.getElementById('docId').value = '';
    document.getElementById('searchInput').value = '';
};

// 辅助函数：填充表单
function populateFormFields(docId, data) {
    document.getElementById('docId').value = docId || '';
    document.getElementById('fullName').value = data.fullName || '';
    document.getElementById('dlNumber').value = data.dlNumber || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('zipCode').value = data.zipCode || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('currentInsurance').value = data.currentInsurance || '';
    document.getElementById('appointmentTime').value = data.appointmentTime || '';
    document.getElementById('medications').value = data.medications || '';
    document.getElementById('doctors').value = data.doctors || '';
    document.getElementById('notes').value = data.notes || '';
}

// ----------------- 管理员后台逻辑 -----------------

window.toggleAdminView = function() {
    const memberSec = document.getElementById('memberSection');
    const adminSec = document.getElementById('adminSection');
    if (adminSec.classList.contains('hidden')) {
        memberSec.classList.add('hidden');
        adminSec.classList.remove('hidden');
    } else {
        adminSec.classList.add('hidden');
        memberSec.classList.remove('hidden');
    }
};

// 管理员登录（示例简易密码设为 admin888）
window.loginAdmin = function() {
    const pwd = document.getElementById('adminPasswordInput').value;
    if (pwd === 'admin888') {
        document.getElementById('adminLoginForm').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        loadAllAdminData();
    } else {
        alert(currentLang === 'zh' ? '密码错误！' : 'Invalid Password!');
    }
};

window.logoutAdmin = function() {
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('adminLoginForm').classList.remove('hidden');
    toggleAdminView();
};

// 加载全量后台数据表格
async function loadAllAdminData() {
    const tbody = document.getElementById('adminDataTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-gray-400">正在获取最新服务器数据...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "medicaid_members"));
        rawCloudData = [];
        tbody.innerHTML = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            rawCloudData.push(data);
            
            const tr = document.createElement('tr');
            tr.className = "border-b hover:bg-gray-50";
            tr.innerHTML = `
                <td class="p-3 font-semibold text-gray-800">${data.fullName || ''}</td>
                <td class="p-3">${data.phone || ''}</td>
                <td class="p-3">${data.dlNumber || ''}</td>
                <td class="p-3">${data.zipCode || ''}</td>
                <td class="p-3">${data.currentInsurance || ''}</td>
                <td class="p-3">${data.appointmentTime || ''}</td>
                <td class="p-3 text-gray-500">${data.updatedAt || ''}</td>
                <td class="p-3 text-center">
                    <button onclick="editRecordFromAdmin('${docSnap.id}')" class="text-blue-600 hover:underline font-semibold">编辑/调取</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-red-500">数据加载失败: ${error.message}</td></tr>`;
    }
}

// 🟢【新增修复】管理员后台编辑/调取指定人员记录
window.editRecordFromAdmin = async function(docId) {
    try {
        const docRef = doc(db, "medicaid_members", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // 1. 将该条记录数据填入前台表单
            populateFormFields(docSnap.id, docSnap.data());
            
            // 2. 自动切换视角回前台表单
            window.toggleAdminView();
            
            // 3. 滚动到页面顶部方便编辑
            window.scrollTo({ top: 0, behavior: 'smooth' });

            alert(currentLang === 'zh' ? `✅ 已成功调取会员【${docSnap.data().fullName}】的数据，修改后保存即可更新！` : `✅ Loaded member [${docSnap.data().fullName}]. Modify and save to update.`);
        } else {
            alert('❌ 该记录在服务器中不存在或已被删除。');
        }
    } catch (error) {
        console.error("Fetch record error:", error);
        alert('❌ 调取失败: ' + error.message);
    }
};

// 导出 Excel 报表
window.exportToExcel = function() {
    if (rawCloudData.length === 0) return alert('暂无数据可导出');
    const ws = XLSX.utils.json_to_sheet(rawCloudData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "会员档案");
    XLSX.writeFile(wb, `美福阳光会员信息表_${new Date().toISOString().slice(0,10)}.xlsx`);
};

// 导出 CSV
window.exportToCSV = function() {
    if (rawCloudData.length === 0) return alert('暂无数据可导出');
    const ws = XLSX.utils.json_to_sheet(rawCloudData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `美福阳光会员信息表_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
};