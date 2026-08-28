// 在 app.js 的表单提交事件回调中：
const form = document.getElementById('insuranceForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // 1. 获取 City 的值（处理级联下拉框与自定义输入的逻辑）
  const countySelect = document.getElementById('countySelect').value;
  const citySelect = document.getElementById('citySelect').value;
  const customCityInput = document.getElementById('customCityInput').value;

  // 确定最终提交的 city 名称
  let finalCity = citySelect;
  if (citySelect === 'Other' || countySelect === 'Other') {
    finalCity = customCityInput;
  }

  // 2. 组装要保存到 Firebase/数据库的客户数据对象
  const clientData = {
    lastName: form.lastName.value,
    firstName: form.firstName.value,
    chineseName: form.chineseName.value,
    dob: form.dob.value,
    phone: form.phone.value,
    email: form.email.value,
    
    // 地址部分新增 City
    streetAddress: form.streetAddress.value,
    county: countySelect,      // 所属县
    city: finalCity,           // 新增：所属城市
    state: form.state.value || "TX",
    zipCode: form.zipCode.value,

    // 保险与 Waiver 信息
    medicaidNumber: form.medicaidNumber.value,
    mcoProvider: form.mcoProvider.value,
    waiverProgram: form.waiverProgram.value,

    createdAt: new Date().toISOString()
  };

  try {
    // 3. 写入 Firebase Firestore 数据库示例
    // await db.collection("clients").add(clientData);
    console.log("即将存入数据库的数据：", clientData);
    alert("客户信息及 City 数据已成功提交！");
    form.reset();
  } catch (error) {
    console.error("提交失败：", error);
  }
});