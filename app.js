import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAFReJ8q3PnNDY41A4dRvHMj-LcWbPx4P0",
    authDomain: "sunshine-insurance-54216.firebaseapp.com",
    projectId: "sunshine-insurance-54216",
    storageBucket: "sunshine-insurance-54216.firebasestorage.app",
    messagingSenderId: "482845933926",
    appId: "1:482845933926:web:187e2c11b1ffae34afc8a7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 多语言字典定义
const i18nData = {
    zh: {
        adminPortal: "管理员后台",
        mainTitle: "美福阳光保险信息采集系统",
        subTitle: "Medicare & Medicaid 会员年度保险更新云端服务平台",
        searchTitle: "🔒 安全检索与调取",
        searchDesc: "为保护个人隐私，需同时匹配【姓名】与【电话号码】方可调取历史档案。",
        searchNamePlaceholder: "会员姓名...",
        searchPhonePlaceholder: "注册电话号码...",
        btnSearch: "验证调取",
        btnReset: "清空/新建",
        sec1Title: "一、 会员基本信息",
        lblFullName: "会员姓名 *",
        lblDob: "出生日期 (DOB) *",
        lblDL: "证件号 / ID Number *",
        lblPhone: "电话号码 *",
        lblAddress: "家庭详细住址 *",
        lblCity: "城市 (City) *",
        lblState: "州 (State) *",
        lblZip: "邮政编码 (ZIP Code) *",
        lblCounty: "所在县/郡 (County) *",
        sec2Title: "二、 原有保险信息",
        lblMbi: "红蓝卡号 (Medicare MBI)",
        lblMedicaidId: "白卡号 (Medicaid ID)",
        lblInsurance: "原医疗保险公司、卡号及计划",
        phInsurance: "例如: UnitedHealthcare / ID / Plan Name...",
        lblMeds: "常用药品清单",
        phMeds: "请列出日常服用的药物名称及剂量...",
        lblDoctors: "常看的医生、医疗机构和药房",
        phDoctors: "请列出希望保留的家庭医生、专科医生/诊所或常用药房...",
        sec3Title: "三、 下一年度保险及医疗需求",
        col1Title: "需求或备注",
        col2Title: "预约保险代理沟通时间",
        lblNotes: "需求或备注",
        lblAppt: "预约保险代理沟通时间",
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
        searchTitle: "🔒 Secure Search & Retrieval",
        searchDesc: "For privacy protection, enter both Name and Phone to fetch record.",
        searchNamePlaceholder: "Member Full Name...",
        searchPhonePlaceholder: "Phone Number...",
        btnSearch: "Verify & Fetch",
        btnReset: "Reset/New",
        sec1Title: "1. Basic Member Information",
        lblFullName: "Full Name *",
        lblDob: "Date of Birth (DOB) *",
        lblDL: "ID Number *",
        lblPhone: "Phone Number *",
        lblAddress: "Home Address *",
        lblCity: "City *",
        lblState: "State *",
        lblZip: "ZIP Code *",
        lblCounty: "County *",
        sec2Title: "2. Existing Insurance Information",
        lblMbi: "Medicare Number (MBI)",
        lblMedicaidId: "Medicaid ID",
        lblInsurance: "Current Insurance, ID & Plan",
        phInsurance: "e.g., UnitedHealthcare / Member ID / Plan Name...",
        lblMeds: "Current Medications",
        phMeds: "List daily medications and dosages...",
        lblDoctors: "Preferred Doctors, Clinics & Pharmacies",
        phDoctors: "List primary care physicians, specialists/clinics or preferred pharmacies...",
        sec3Title: "3. Next Year Insurance & Medical Needs",
        col1Title: "Needs / Remarks",
        col2Title: "Agent Appointment Time",
        lblNotes: "Needs / Remarks",
        lblAppt: "Appointment Time with Agent",
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
let rawCloudData = []; 

function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    document.getElementById('langToggleBtn').innerText = currentLang === 'zh' ? 'English' : '中文';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData[currentLang][key]) {
            el.innerText = i18nData[currentLang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18nData[currentLang][key]) {
            el.placeholder = i18nData[currentLang][key];
        }
    });
}

function convertLinesToInlineSemicolons(text) {
    if (!text) return "";
    return text
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .join("；");
}

function autoResizeTextareas() {
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight + 4) + 'px';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight + 4) + 'px';
        });
    });
});

async function saveToCloudAndPrint(event) {
    event.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerText = currentLang === 'zh' ? '正在上传服务器...' : 'Uploading...';

    const medsInput = document.getElementById('medications');
    const docsInput = document.getElementById('doctors');
    
    const formattedMeds = convertLinesToInlineSemicolons(medsInput.value);
    const formattedDocs = convertLinesToInlineSemicolons(docsInput.value);

    if (formattedMeds) medsInput.value = formattedMeds;
    if (formattedDocs) docsInput.value = formattedDocs;

    const docId = document.getElementById('docId').value;
    const record = {
        fullName: document.getElementById('fullName').value.trim(),
        dob: document.getElementById('dob').value,
        dlNumber: document.getElementById('dlNumber').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value.trim(),
        county: document.getElementById('county').value,
        mbiNumber: document.getElementById('mbiNumber').value.trim(),
        medicaidId: document.getElementById('medicaidId').value.trim(),
        currentInsurance: document.getElementById('currentInsurance').value.trim(),
        medications: formattedMeds,
        doctors: formattedDocs,
        notes: document.getElementById('notes').value.trim(),
        appointmentTime: document.getElementById('appointmentTime').value,
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
        
        autoResizeTextareas();
        window.print();
    } catch (error) {
        console.error("Save error:", error);
        alert('❌ Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = i18nData[currentLang].btnSubmit;
    }
}

async function searchCloudRecord() {
    const nameStr = document.getElementById('searchNameInput').value.trim();
    const phoneStr = document.getElementById('searchPhoneInput').value.trim();

    if (!nameStr || !phoneStr) {
        return alert(currentLang === 'zh' 
            ? '🔒 为保护隐私，请输入【姓名】和【电话号码】进行双重验证调取！' 
            : 'Please enter both Name and Phone number for security verification.');
    }

    try {
        const membersRef = collection(db, "medicaid_members");
        const q = query(
            membersRef, 
            where("fullName", "==", nameStr),
            where("phone", "==", phoneStr)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            populateFormFields(docData.id, docData.data());
            alert(currentLang === 'zh' ? `✅ 身份验证成功，已调取【${docData.data().fullName}】的档案！` : `✅ Record verified & fetched!`);
        } else {
            alert(currentLang === 'zh' ? '❌ 验证失败：姓名与电话号码不匹配，或云端库中无此记录。' : 'No matching record found. Verification failed.');
        }
    } catch (error) {
        alert('Fetch error: ' + error.message);
    }
}

function resetForm() {
    document.getElementById('infoForm').reset();
    document.getElementById('docId').value = '';
    document.getElementById('searchNameInput').value = '';
    document.getElementById('searchPhoneInput').value = '';
    document.querySelectorAll('textarea').forEach(ta => ta.style.height = 'auto');
}

function populateFormFields(docId, data) {
    document.getElementById('docId').value = docId || '';
    document.getElementById('fullName').value = data.fullName || '';
    document.getElementById('dob').value = data.dob || '';
    document.getElementById('dlNumber').value = data.dlNumber || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('city').value = data.city || '';
    document.getElementById('state').value = data.state || 'TX';
    document.getElementById('zipCode').value = data.zipCode || '';
    document.getElementById('county').value = data.county || '';
    document.getElementById('mbiNumber').value = data.mbiNumber || '';
    document.getElementById('medicaidId').value = data.medicaidId || '';
    document.getElementById('currentInsurance').value = data.currentInsurance || '';
    document.getElementById('medications').value = data.medications || '';
    document.getElementById('doctors').value = data.doctors || '';
    document.getElementById('notes').value = data.notes || '';
    document.getElementById('appointmentTime').value = data.appointmentTime || '';

    setTimeout(autoResizeTextareas, 100);
}

function toggleAdminView() {
    const memberSec = document.getElementById('memberSection');
    const adminSec = document.getElementById('adminSection');
    if (adminSec.classList.contains('hidden')) {
        memberSec.classList.add('hidden');
        adminSec.classList.remove('hidden');
    } else {
        adminSec.classList.add('hidden');
        memberSec.classList.remove('hidden');
    }
}

function loginAdmin() {
    const pwd = document.getElementById('adminPasswordInput').value;
    if (pwd === 'admin888') {
        document.getElementById('adminLoginForm').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        loadAllAdminData();
    } else {
        alert(currentLang === 'zh' ? '密码错误！' : 'Invalid Password!');
    }
}

function logoutAdmin() {
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('adminLoginForm').classList.remove('hidden');
    toggleAdminView();
}

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
                <td class="p-3">${data.dob || ''}</td>
                <td class="p-3">${data.phone || ''}</td>
                <td class="p-3">${data.city || ''}, ${data.state || 'TX'} / ${data.county || ''}</td>
                <td class="p-3">${data.mbiNumber || ''}</td>
                <td class="p-3">${data.currentInsurance || ''}</td>
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

async function editRecordFromAdmin(docId) {
    try {
        const docRef = doc(db, "medicaid_members", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            populateFormFields(docSnap.id, docSnap.data());
            toggleAdminView();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert(currentLang === 'zh' ? `✅ 已调取会员【${docSnap.data().fullName}】的数据，修改后保存即可更新！` : `✅ Loaded member [${docSnap.data().fullName}].`);
        } else {
            alert('❌ 该记录在服务器中不存在或已被删除。');
        }
    } catch (error) {
        console.error("Fetch record error:", error);
        alert('❌ 调取失败: ' + error.message);
    }
}

function exportToExcel() {
    if (rawCloudData.length === 0) return alert('暂无数据可导出');
    const ws = XLSX.utils.json_to_sheet(rawCloudData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "会员档案");
    XLSX.writeFile(wb, `美福阳光会员信息表_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function exportToCSV() {
    if (rawCloudData.length === 0) return alert('暂无数据可导出');
    const ws = XLSX.utils.json_to_sheet(rawCloudData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `美福阳光会员信息表_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// 显式挂载全局函数，确保 ES Module 作用域下 HTML 内联 onclick 可正常调用
window.toggleLanguage = toggleLanguage;
window.saveToCloudAndPrint = saveToCloudAndPrint;
window.searchCloudRecord = searchCloudRecord;
window.resetForm = resetForm;
window.toggleAdminView = toggleAdminView;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.editRecordFromAdmin = editRecordFromAdmin;
window.exportToExcel = exportToExcel;
window.exportToCSV = exportToCSV;