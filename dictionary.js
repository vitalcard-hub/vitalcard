// dictionary.js
// Diccionario de términos médicos comunes en 8 idiomas.
// Cubre a la mayoría de la población mundial + idiomas de zonas médicas de referencia.
// Código de idioma ISO 639-1. El inglés SIEMPRE se muestra como respaldo universal.

const LANGS = [
  { code: 'es', label: 'Español', native: 'Español' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'pt', label: 'Português', native: 'Português' },
  { code: 'fr', label: 'Français', native: 'Français' },
  { code: 'de', label: 'Deutsch', native: 'Deutsch' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

// UI strings (interfaz de la app)
const UI = {
  appName: { es:'VitalCard', en:'VitalCard', pt:'VitalCard', fr:'VitalCard', de:'VitalCard', zh:'VitalCard', ar:'VitalCard', hi:'VitalCard' },
  emergencyCard: { es:'Tarjeta de Emergencia', en:'Emergency Card', pt:'Cartão de Emergência', fr:"Carte d'Urgence", de:'Notfallkarte', zh:'紧急卡', ar:'بطاقة الطوارئ', hi:'आपातकालीन कार्ड' },
  bloodType: { es:'Tipo de sangre', en:'Blood type', pt:'Tipo sanguíneo', fr:'Groupe sanguin', de:'Blutgruppe', zh:'血型', ar:'فصيلة الدم', hi:'रक्त समूह' },
  allergies: { es:'Alergias', en:'Allergies', pt:'Alergias', fr:'Allergies', de:'Allergien', zh:'过敏', ar:'الحساسية', hi:'एलर्जी' },
  noAllergies: { es:'Sin alergias conocidas', en:'No known allergies', pt:'Sem alergias conhecidas', fr:'Aucune allergie connue', de:'Keine bekannten Allergien', zh:'无已知过敏', ar:'لا توجد حساسية معروفة', hi:'कोई ज्ञात एलर्जी नहीं' },
  conditions: { es:'Enfermedades / condiciones', en:'Conditions', pt:'Condições', fr:'Conditions médicales', de:'Erkrankungen', zh:'疾病状况', ar:'الحالات الطبية', hi:'स्वास्थ्य स्थितियाँ' },
  birthConditions: { es:'Condiciones de nacimiento', en:'Congenital conditions', pt:'Condições congênitas', fr:'Conditions congénitales', de:'Angeborene Erkrankungen', zh:'先天性疾病', ar:'حالات خلقية', hi:'जन्मजात स्थितियाँ' },
  medications: { es:'Medicamentos actuales', en:'Current medications', pt:'Medicamentos atuais', fr:'Médicaments actuels', de:'Aktuelle Medikamente', zh:'目前用药', ar:'الأدوية الحالية', hi:'वर्तमान दवाएँ' },
  surgeries: { es:'Cirugías previas', en:'Past surgeries', pt:'Cirurgias anteriores', fr:'Chirurgies antérieures', de:'Frühere Operationen', zh:'既往手术', ar:'عمليات جراحية سابقة', hi:'पिछली सर्जरी' },
  emergencyContact: { es:'Contacto de emergencia', en:'Emergency contact', pt:'Contato de emergência', fr:"Contact d'urgence", de:'Notfallkontakt', zh:'紧急联系人', ar:'جهة اتصال الطوارئ', hi:'आपातकालीन संपर्क' },
  organDonor: { es:'Donante de órganos', en:'Organ donor', pt:'Doador de órgãos', fr:"Donneur d'organes", de:'Organspender', zh:'器官捐赠者', ar:'متبرع بالأعضاء', hi:'अंग दाता' },
  notes: { es:'Notas adicionales', en:'Additional notes', pt:'Notas adicionais', fr:'Notes supplémentaires', de:'Zusätzliche Hinweise', zh:'其他备注', ar:'ملاحظات إضافية', hi:'अतिरिक्त नोट्स' },
  severity: { es:'Gravedad', en:'Severity', pt:'Gravidade', fr:'Gravité', de:'Schweregrad', zh:'严重程度', ar:'الشدة', hi:'गंभीरता' },
  severe: { es:'GRAVE — riesgo de shock anafiláctico', en:'SEVERE — anaphylaxis risk', pt:'GRAVE — risco de choque anafilático', fr:'GRAVE — risque de choc anaphylactique', de:'SCHWER — Anaphylaxierisiko', zh:'严重 — 有过敏性休克风险', ar:'خطير — خطر الصدمة التأقية', hi:'गंभीर — एनाफाइलैक्सिस का खतरा' },
  moderate: { es:'Moderada', en:'Moderate', pt:'Moderada', fr:'Modérée', de:'Mäßig', zh:'中度', ar:'متوسط', hi:'मध्यम' },
  mild: { es:'Leve', en:'Mild', pt:'Leve', fr:'Légère', de:'Leicht', zh:'轻度', ar:'خفيف', hi:'हल्का' },
  editData: { es:'Editar mis datos', en:'Edit my data', pt:'Editar meus dados', fr:'Modifier mes données', de:'Meine Daten bearbeiten', zh:'编辑我的资料', ar:'تعديل بياناتي', hi:'मेरा डेटा संपादित करें' },
  doctorMode: { es:'Modo médico (pantalla completa)', en:'Doctor mode (full screen)', pt:'Modo médico (tela cheia)', fr:'Mode médecin (plein écran)', de:'Arztmodus (Vollbild)', zh:'医生模式（全屏）', ar:'وضع الطبيب (ملء الشاشة)', hi:'डॉक्टर मोड (पूर्ण स्क्रीन)' },
  showQR: { es:'Mostrar código QR', en:'Show QR code', pt:'Mostrar código QR', fr:'Afficher le code QR', de:'QR-Code anzeigen', zh:'显示二维码', ar:'إظهار رمز QR', hi:'QR कोड दिखाएँ' },
  dataOnDevice: { es:'Tus datos solo están en este dispositivo. Nadie más los ve, ningún servidor los guarda.', en:'Your data lives only on this device. No one else sees it, no server stores it.', pt:'Seus dados ficam apenas neste dispositivo. Ninguém mais os vê, nenhum servidor os armazena.', fr:"Vos données restent uniquement sur cet appareil. Personne d'autre ne les voit, aucun serveur ne les stocke.", de:'Ihre Daten befinden sich nur auf diesem Gerät. Niemand sonst sieht sie, kein Server speichert sie.', zh:'您的数据仅存储在此设备上，不会上传到任何服务器。', ar:'بياناتك موجودة فقط على هذا الجهاز. لا يراها أحد آخر ولا يخزنها أي خادم.', hi:'आपका डेटा केवल इस डिवाइस पर है। कोई भी सर्वर इसे संग्रहीत नहीं करता।' },
  printCard: { es:'Imprimir tarjeta física', en:'Print physical card', pt:'Imprimir cartão físico', fr:'Imprimer la carte physique', de:'Physische Karte drucken', zh:'打印实体卡', ar:'طباعة البطاقة الورقية', hi:'भौतिक कार्ड प्रिंट करें' },
  walletCard: { es:'Tarjeta para billetera', en:'Wallet card', pt:'Cartão para carteira', fr:'Carte pour portefeuille', de:'Karte für Geldbörse', zh:'钱包卡', ar:'بطاقة للمحفظة', hi:'वॉलेट कार्ड' },
  stickerBack: { es:'Sticker para el reverso del celular', en:'Sticker for phone back', pt:'Adesivo para o verso do celular', fr:'Autocollant pour le dos du téléphone', de:'Aufkleber für die Handyrückseite', zh:'手机背面贴纸', ar:'ملصق لظهر الهاتف', hi:'फोन के पीछे के लिए स्टिकर' },
  cutHere: { es:'✂ cortar aquí', en:'✂ cut here', pt:'✂ cortar aqui', fr:'✂ couper ici', de:'✂ hier schneiden', zh:'✂ 剪裁线', ar:'✂ اقطع هنا', hi:'✂ यहाँ काटें' },
  scanForFull: { es:'Escanear para ficha completa', en:'Scan for full record', pt:'Escanear para ficha completa', fr:'Scanner pour le dossier complet', de:'Scannen für vollständigen Datensatz', zh:'扫描查看完整记录', ar:'امسح للحصول على السجل الكامل', hi:'पूर्ण रिकॉर्ड के लिए स्कैन करें' },
};

// Alergias comunes (clave -> traducciones + icono)
const ALLERGY_DICT = {
  penicillin:   { icon:'💊', es:'Penicilina', en:'Penicillin', pt:'Penicilina', fr:'Pénicilline', de:'Penizillin', zh:'青霉素', ar:'البنسلين', hi:'पेनिसिलिन' },
  sulfa:        { icon:'💊', es:'Sulfonamidas', en:'Sulfa drugs', pt:'Sulfonamidas', fr:'Sulfamides', de:'Sulfonamide', zh:'磺胺类药物', ar:'أدوية السلفا', hi:'सल्फा दवाएँ' },
  aspirin_nsaid:{ icon:'💊', es:'Aspirina / AINEs', en:'Aspirin / NSAIDs', pt:'Aspirina / AINEs', fr:'Aspirine / AINS', de:'Aspirin / NSAR', zh:'阿司匹林/非甾体抗炎药', ar:'الأسبرين / مضادات الالتهاب', hi:'एस्पिरिन / NSAIDs' },
  latex:        { icon:'🧤', es:'Látex', en:'Latex', pt:'Látex', fr:'Latex', de:'Latex', zh:'乳胶', ar:'اللاتكس', hi:'लेटेक्स' },
  iodine_contrast:{ icon:'💉', es:'Yodo / contraste', en:'Iodine / contrast dye', pt:'Iodo / contraste', fr:'Iode / produit de contraste', de:'Jod / Kontrastmittel', zh:'碘/造影剂', ar:'اليود / صبغة التباين', hi:'आयोडीन / कंट्रास्ट डाई' },
  general_anesthesia:{ icon:'💉', es:'Anestesia general', en:'General anesthesia', pt:'Anestesia geral', fr:'Anesthésie générale', de:'Vollnarkose', zh:'全身麻醉', ar:'التخدير العام', hi:'सामान्य संज्ञाहरण' },
  bee_sting:    { icon:'🐝', es:'Picadura de abeja/avispa', en:'Bee/wasp stings', pt:'Picada de abelha/vespa', fr:"Piqûre d'abeille/guêpe", de:'Bienen-/Wespenstich', zh:'蜂蜇', ar:'لسعة النحل/الدبور', hi:'मधुमक्खी/ततैया का डंक' },
  peanuts:      { icon:'🥜', es:'Maní / cacahuate', en:'Peanuts', pt:'Amendoim', fr:'Arachides', de:'Erdnüsse', zh:'花生', ar:'الفول السوداني', hi:'मूंगफली' },
  tree_nuts:    { icon:'🌰', es:'Frutos secos', en:'Tree nuts', pt:'Nozes', fr:'Fruits à coque', de:'Baumnüsse', zh:'坚果', ar:'المكسرات', hi:'मेवे' },
  shellfish:    { icon:'🦐', es:'Mariscos', en:'Shellfish', pt:'Frutos do mar', fr:'Fruits de mer', de:'Meeresfrüchte', zh:'贝类海鲜', ar:'المحار', hi:'शेलफिश' },
  eggs:         { icon:'🥚', es:'Huevo', en:'Eggs', pt:'Ovo', fr:'Œuf', de:'Ei', zh:'鸡蛋', ar:'البيض', hi:'अंडा' },
  dairy:        { icon:'🥛', es:'Lácteos', en:'Dairy', pt:'Laticínios', fr:'Produits laitiers', de:'Milchprodukte', zh:'乳制品', ar:'منتجات الألبان', hi:'डेयरी' },
  gluten:       { icon:'🌾', es:'Gluten', en:'Gluten', pt:'Glúten', fr:'Gluten', de:'Gluten', zh:'麸质', ar:'الغلوتين', hi:'ग्लूटेन' },
};

const CONDITION_DICT = {
  diabetes1:    { icon:'🩸', es:'Diabetes tipo 1', en:'Type 1 diabetes', pt:'Diabetes tipo 1', fr:'Diabète de type 1', de:'Typ-1-Diabetes', zh:'1型糖尿病', ar:'داء السكري النوع 1', hi:'टाइप 1 मधुमेह' },
  diabetes2:    { icon:'🩸', es:'Diabetes tipo 2', en:'Type 2 diabetes', pt:'Diabetes tipo 2', fr:'Diabète de type 2', de:'Typ-2-Diabetes', zh:'2型糖尿病', ar:'داء السكري النوع 2', hi:'टाइप 2 मधुमेह' },
  hypertension: { icon:'❤️', es:'Hipertensión', en:'Hypertension', pt:'Hipertensão', fr:'Hypertension', de:'Bluthochdruck', zh:'高血压', ar:'ارتفاع ضغط الدم', hi:'उच्च रक्तचाप' },
  asthma:       { icon:'🫁', es:'Asma', en:'Asthma', pt:'Asma', fr:'Asthme', de:'Asthma', zh:'哮喘', ar:'الربو', hi:'दमा' },
  epilepsy:     { icon:'🧠', es:'Epilepsia', en:'Epilepsy', pt:'Epilepsia', fr:'Épilepsie', de:'Epilepsie', zh:'癫痫', ar:'الصرع', hi:'मिर्गी' },
  heart_disease:{ icon:'❤️', es:'Enfermedad cardíaca', en:'Heart disease', pt:'Doença cardíaca', fr:'Maladie cardiaque', de:'Herzkrankheit', zh:'心脏病', ar:'مرض القلب', hi:'हृदय रोग' },
  kidney_disease:{ icon:'🫘', es:'Enfermedad renal', en:'Kidney disease', pt:'Doença renal', fr:'Maladie rénale', de:'Nierenkrankheit', zh:'肾病', ar:'مرض الكلى', hi:'गुर्दे की बीमारी' },
  liver_disease:{ icon:'🫀', es:'Enfermedad hepática', en:'Liver disease', pt:'Doença hepática', fr:'Maladie du foie', de:'Lebererkrankung', zh:'肝病', ar:'مرض الكبد', hi:'यकृत रोग' },
  thyroid:      { icon:'🦋', es:'Trastorno de tiroides', en:'Thyroid disorder', pt:'Distúrbio da tireoide', fr:'Trouble thyroïdien', de:'Schilddrüsenerkrankung', zh:'甲状腺疾病', ar:'اضطراب الغدة الدرقية', hi:'थायरॉइड विकार' },
  hiv:          { icon:'🩺', es:'VIH', en:'HIV', pt:'HIV', fr:'VIH', de:'HIV', zh:'艾滋病毒', ar:'فيروس نقص المناعة', hi:'एचआईवी' },
  celiac:       { icon:'🌾', es:'Enfermedad celíaca', en:'Celiac disease', pt:'Doença celíaca', fr:'Maladie cœliaque', de:'Zöliakie', zh:'乳糜泻', ar:'مرض السيلياك', hi:'सीलिएक रोग' },
  copd:         { icon:'🫁', es:'EPOC', en:'COPD', pt:'DPOC', fr:'BPCO', de:'COPD', zh:'慢性阻塞性肺病', ar:'مرض الانسداد الرئوي المزمن', hi:'सीओपीडी' },
  pacemaker:    { icon:'🔋', es:'Marcapasos', en:'Pacemaker', pt:'Marca-passo', fr:'Stimulateur cardiaque', de:'Herzschrittmacher', zh:'心脏起搏器', ar:'جهاز تنظيم ضربات القلب', hi:'पेसमेकर' },
};

const BIRTH_CONDITION_DICT = {
  congenital_heart: { icon:'❤️', es:'Cardiopatía congénita', en:'Congenital heart defect', pt:'Cardiopatia congênita', fr:'Cardiopathie congénitale', de:'Angeborener Herzfehler', zh:'先天性心脏病', ar:'عيب خلقي في القلب', hi:'जन्मजात हृदय दोष' },
  sickle_cell:  { icon:'🩸', es:'Anemia falciforme', en:'Sickle cell disease', pt:'Anemia falciforme', fr:'Drépanocytose', de:'Sichelzellenanämie', zh:'镰状细胞病', ar:'فقر الدم المنجلي', hi:'सिकल सेल रोग' },
  hemophilia:   { icon:'🩸', es:'Hemofilia', en:'Hemophilia', pt:'Hemofilia', fr:'Hémophilie', de:'Hämophilie', zh:'血友病', ar:'الهيموفيليا', hi:'हीमोफीलिया' },
  cystic_fibrosis:{ icon:'🫁', es:'Fibrosis quística', en:'Cystic fibrosis', pt:'Fibrose cística', fr:'Mucoviscidose', de:'Mukoviszidose', zh:'囊性纤维化', ar:'التليف الكيسي', hi:'सिस्टिक फाइब्रोसिस' },
  down_syndrome:{ icon:'🧬', es:'Síndrome de Down', en:'Down syndrome', pt:'Síndrome de Down', fr:'Syndrome de Down', de:'Down-Syndrom', zh:'唐氏综合症', ar:'متلازمة داون', hi:'डाउन सिंड्रोम' },
  spina_bifida: { icon:'🧬', es:'Espina bífida', en:'Spina bifida', pt:'Espinha bífida', fr:'Spina bifida', de:'Spina bifida', zh:'脊柱裂', ar:'السنسنة المشقوقة', hi:'स्पाइना बिफिडा' },
  pku:          { icon:'🧬', es:'Fenilcetonuria (PKU)', en:'Phenylketonuria (PKU)', pt:'Fenilcetonúria (PKU)', fr:'Phénylcétonurie (PCU)', de:'Phenylketonurie (PKU)', zh:'苯丙酮尿症', ar:'بيلة الفينيل كيتون', hi:'फेनिलकेटोनुरिया' },
};

const BLOOD_TYPES = ['O+','O-','A+','A-','B+','B-','AB+','AB-','?'];

function t(dict, key, lang){
  const entry = dict[key];
  if(!entry) return key;
  return entry[lang] || entry.en || entry.es;
}
