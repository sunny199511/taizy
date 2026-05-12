import { useState, useEffect, useRef } from "react";
import {
  Search, Menu, X, ChevronRight, MapPin, Star, ArrowRight,
  Filter, Check, ExternalLink, Pencil, ShieldCheck, Upload, Save, Phone
} from "lucide-react";

const TEAL = "#0a7c6e";
const TEAL_LIGHT = "#e6f4f2";
const INK = "#1a1a1a";
const AMBER = "#b45309";
const AMBER_LIGHT = "#fef3c7";

const NAV_CATS = ["居家生活","穿搭時尚","飲食料理","美容保養","文創禮品","寵物親子","職人師傅","手工藝達人"];
const CAT_EMOJI = { "居家生活":"🏠","穿搭時尚":"👗","飲食料理":"🍽","美容保養":"💆","文創禮品":"🎁","寵物親子":"🐾","職人師傅":"🔨","手工藝達人":"🎨" };
const FILTERS = ["全部", ...NAV_CATS];

const CRAFTSMAN_SERVICES = ["木工裝潢","水電工程","泥作磁磚","油漆粉刷","鐵工焊接","冷氣空調","廚具安裝","衛浴工程","地板施作","隔間工程","門窗工程","防水工程","清潔工程","搬家服務","其他"];

const DEFAULT_SHOPS = [
  { id:1, name:"三和木業",  en:"SANHE WOODCRAFT",    cat:"居家生活", tag:"精品家具", desc:"百年檜木工藝，每件作品皆為獨一無二的台灣林業結晶。", loc:"南投縣", color:"#f5f0e8" },
  { id:2, name:"鹿野高台茶",en:"LUYE HIGHLAND TEA",  cat:"飲食料理", tag:"在地茶葉", desc:"海拔800公尺的天然茶園，手採烏龍，藏著台灣山林的氣息。", loc:"台東縣", color:"#e8f0e8" },
  { id:3, name:"承皮製作所",en:"CHEN LEATHER STUDIO",cat:"穿搭時尚", tag:"手工皮鞋", desc:"台南製鞋世家第三代，堅持全手縫底，只用植鞣牛皮。", loc:"台南市", color:"#f0ebe4" },
  { id:4, name:"大同電器",  en:"TATUNG APPLIANCES",  cat:"居家生活", tag:"精品家電", desc:"70年台灣電器老品牌，經典電鍋養活了無數個世代的台灣家庭。", loc:"台北市", color:"#e8eef5" },
  { id:5, name:"宜蘭礁溪陶",en:"JIAOXI CERAMICS",   cat:"文創禮品", tag:"手作陶藝", desc:"礁溪溫泉礦物入釉，每件陶器帶有獨特的天然礦石紋理。", loc:"宜蘭縣", color:"#f0e8f0" },
  { id:6, name:"飛魚文化樂器",en:"FLYING FISH MUSIC",cat:"文創禮品", tag:"原民樂器", desc:"阿美族傳統工法，手工製作弓琴、口簧琴，傳遞原住民族音樂靈魂。", loc:"花蓮縣", color:"#f5ece8" },
  { id:7, name:"PLAYZU 歐美設計地墊", en:"PLAYZU HOME", cat:"居家生活", tag:"設計地墊", desc:"源於對家庭幸福的守護，提供高品質、舒適且具設計感的歐美風格地墊。讓您辛苦工作回家後，感受腳下的片刻溫暖。", loc:"臺灣製造", color:"#eaf0f5", url:"https://www.playzu.com.tw/" },
];

function MITBadge() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:TEAL, color:"#fff", fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"3px 8px", borderRadius:4 }}>
      <Check size={10} strokeWidth={3}/> 100% MIT
    </span>
  );
}

function StarRating({ val }) {
  return (
    <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:12, color:TEAL, fontWeight:600 }}>
      <Star size={12} fill={TEAL} stroke="none"/>{val.toFixed(1)}
    </span>
  );
}

function EditModal({ shop, onSave, onClose }) {
  const [form, setForm] = useState({
    name: shop.name, en: shop.en, desc: shop.desc,
    cat: shop.cat || "", tag: shop.tag || "",
    hasPhysicalStore: shop.hasPhysicalStore ?? true,
    loc: shop.loc || "", address: shop.address || "",
    phone: shop.phone || "",
    url: shop.url || "",
    ecomUrl: shop.ecomUrl || "",
    mitTaiwan: shop.mitTaiwan ?? true,
    rawMaterial: shop.rawMaterial || "",
    originCountry: shop.originCountry || "",
    processType: shop.processType || "",
    hitoDesc: shop.hitoDesc || "",
    services: shop.services || [],
  });
  const [imgPreview, setImgPreview] = useState(shop.image || null);
  const [hitoImages, setHitoImages] = useState(shop.hitoImages || []);
  const fileRef = useRef();
  const hitoFileRef = useRef();

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleHitoFiles = (e) => {
    const files = Array.from(e.target.files||[]);
    const remaining = 4 - hitoImages.length;
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setHitoImages(prev => prev.length < 4 ? [...prev, ev.target.result] : prev);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeHitoImg = (idx) => setHitoImages(prev => prev.filter((_,i)=>i!==idx));

  const handleSave = () => {
    if (!form.name.trim()) { alert("請填寫店家名稱！"); return; }
    onSave({ ...shop, ...form, image: imgPreview, hitoImages });
  };

  const Field = ({ label, k, placeholder, type="text", textarea=false }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:600, color:"#666", display:"block", marginBottom:5, letterSpacing:"0.05em" }}>{label}</label>
      {textarea
        ? <textarea value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
            style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"10px 13px", fontSize:14, fontFamily:"inherit", color:INK, resize:"vertical", minHeight:88, lineHeight:1.65 }}/>
        : <input type={type} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
            style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"10px 13px", fontSize:14, fontFamily:"inherit", color:INK }}/>
      }
    </div>
  );

  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:520, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.22)", animation:"popIn 0.22s cubic-bezier(.34,1.56,.64,1)" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 16px", borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, background:"#fff", zIndex:1, borderRadius:"20px 20px 0 0" }}>
          <div>
            <div style={{ fontSize:11, color:AMBER, fontWeight:700, letterSpacing:"0.12em", marginBottom:3 }}>✏️ 編輯店家資料</div>
            <div style={{ fontSize:17, fontWeight:800, color:INK }}>{shop.name}</div>
          </div>
          <button onClick={onClose} style={{ background:"#f5f5f5", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={16}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:"20px 24px 24px" }}>

          {/* Image Upload */}
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#666", display:"block", marginBottom:6, letterSpacing:"0.05em" }}>封面圖片</label>
            <div onClick={()=>fileRef.current?.click()}
              style={{ border:`2px dashed ${imgPreview?TEAL:"#e0e0e0"}`, borderRadius:12, height:128, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", position:"relative", background: imgPreview?"#000":"#fafafa", transition:"border-color 0.2s" }}>
              {imgPreview
                ? <img src={imgPreview} alt="預覽" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.85 }}/>
                : <><Upload size={22} color="#ccc"/><span style={{ fontSize:13, color:"#bbb", marginTop:8 }}>點擊上傳圖片</span><span style={{ fontSize:11, color:"#ccc", marginTop:3 }}>JPG、PNG、WEBP</span></>
              }
              {imgPreview && (
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", opacity:0, transition:"opacity 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
                  <span style={{ color:"#fff", fontSize:13, fontWeight:600 }}>點擊更換圖片</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
            <div style={{ gridColumn:"1/-1" }}><Field label="店家名稱 *" k="name" placeholder="例：三和木業"/></div>
            <Field label="英文名稱" k="en" placeholder="SANHE WOODCRAFT"/>
            <Field label="商品標籤" k="tag" placeholder="例：手工皮鞋、有機茶葉…"/>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:"#666", display:"block", marginBottom:5, letterSpacing:"0.05em" }}>產業分類</label>
              <select value={form.cat||""} onChange={e=>set("cat",e.target.value)}
                style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"10px 13px", fontSize:14, fontFamily:"inherit", color: form.cat?INK:"#aaa", background:"#fff", appearance:"auto" }}>
                <option value="" disabled>請選擇分類</option>
                {NAV_CATS.map(c=><option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:"1/-1" }}><Field label="店家介紹" k="desc" placeholder="簡短描述這家店的特色…" textarea/></div>
          </div>

          {/* 是否提供實體資訊 */}
          <div style={{ marginBottom:14, background:"#f8f8f8", border:"1.5px solid #e8e8e8", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:INK, marginBottom:2 }}>提供實體店面資訊</div>
                <div style={{ fontSize:11, color:"#888" }}>
                  {form.hasPhysicalStore ? "顯示電話、地址等聯絡資訊" : "純線上銷售，不顯示實體資訊"}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, fontWeight:600, color: form.hasPhysicalStore?TEAL:"#aaa" }}>是</span>
                <div onClick={()=>set("hasPhysicalStore", !form.hasPhysicalStore)}
                  style={{ width:42, height:24, background:form.hasPhysicalStore?TEAL:"#ddd", borderRadius:12, position:"relative", cursor:"pointer", transition:"background 0.25s" }}>
                  <div style={{ position:"absolute", top:3, left:form.hasPhysicalStore?21:3, width:18, height:18, background:"#fff", borderRadius:"50%", transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: form.hasPhysicalStore?"#aaa":"#555" }}>否</span>
              </div>
            </div>

            {form.hasPhysicalStore && (
              <div style={{ borderTop:"1px solid #e8e8e8", paddingTop:14, marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
                <Field label="縣市地區" k="loc" placeholder="例：台南市"/>
                <Field label="聯絡電話" k="phone" placeholder="例：02-1234-5678" type="tel"/>
                <div style={{ gridColumn:"1/-1" }}><Field label="詳細地址" k="address" placeholder="例：台南市中西區民族路二段123號"/></div>
              </div>
            )}

            {!form.hasPhysicalStore && (
              <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"#0369a1", fontWeight:600, background:"#eff6ff", borderRadius:8, padding:"5px 12px" }}>
                🛒 純線上銷售
              </div>
            )}
          </div>

          {/* 服務項目（職人師傅專屬） */}
          {form.cat === "職人師傅" && (
            <div style={{ marginBottom:14, border:"1.5px solid #d4e8d4", borderRadius:12, padding:"14px 16px", background:"#f4fbf4" }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#2d6a2d", marginBottom:4, letterSpacing:"0.04em" }}>🔨 服務項目</div>
              <div style={{ fontSize:11, color:"#5a8a5a", marginBottom:12 }}>可複選，勾選此師傅提供的服務</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {CRAFTSMAN_SERVICES.map(s => {
                  const active = form.services.includes(s);
                  return (
                    <button key={s} type="button"
                      onClick={()=> set("services", active ? form.services.filter(x=>x!==s) : [...form.services, s])}
                      style={{
                        fontSize:12, fontWeight:600, fontFamily:"inherit", cursor:"pointer",
                        padding:"6px 14px", borderRadius:20,
                        background: active ? TEAL : "#fff",
                        color: active ? "#fff" : "#555",
                        border: `1.5px solid ${active ? TEAL : "#ddd"}`,
                        transition:"all 0.15s", display:"flex", alignItems:"center", gap:5,
                      }}>
                      {active && <Check size={11} strokeWidth={3}/>}{s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MIT 台灣製造 區塊 */}
          <div style={{ marginBottom:14, background:"#f8fffe", border:`1.5px solid ${form.mitTaiwan?"#9fd3c7":"#e5e5e5"}`, borderRadius:12, padding:"14px 16px", transition:"border-color 0.2s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: form.mitTaiwan ? 0 : 14 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:INK, marginBottom:2 }}>100% 臺灣製造</div>
                <div style={{ fontSize:11, color:"#888" }}>{form.mitTaiwan ? "原料到製造全程在臺灣完成" : "非全程臺灣製造，請填寫詳情"}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:12, fontWeight:600, color: form.mitTaiwan?TEAL:"#aaa" }}>是</span>
                <div onClick={()=>set("mitTaiwan", !form.mitTaiwan)}
                  style={{ width:42, height:24, background:form.mitTaiwan?TEAL:"#ddd", borderRadius:12, position:"relative", cursor:"pointer", transition:"background 0.25s" }}>
                  <div style={{ position:"absolute", top:3, left:form.mitTaiwan?21:3, width:18, height:18, background:"#fff", borderRadius:"50%", transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: form.mitTaiwan?"#aaa":"#c0392b" }}>否</span>
              </div>
            </div>

            {!form.mitTaiwan && (
              <div style={{ borderTop:"1px solid #e8e8e8", paddingTop:14, display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#666", display:"block", marginBottom:5 }}>原料（請補充哪些原料非臺灣製造）</label>
                  <input value={form.rawMaterial} onChange={e=>set("rawMaterial",e.target.value)}
                    placeholder="例：皮革、棉料、五金配件…"
                    style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"9px 13px", fontSize:14, fontFamily:"inherit", color:INK }}/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#666", display:"block", marginBottom:5 }}>原料產地</label>
                  <input value={form.originCountry} onChange={e=>set("originCountry",e.target.value)}
                    placeholder="例：越南、日本、美國…"
                    style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:10, padding:"9px 13px", fontSize:14, fontFamily:"inherit", color:INK }}/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:"#666", display:"block", marginBottom:8 }}>加工方式</label>
                  <div style={{ display:"flex", gap:10 }}>
                    {["臺灣分裝","臺灣加工"].map(opt=>(
                      <label key={opt} style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", fontSize:13, fontWeight:600, color: form.processType===opt?TEAL:"#666",
                        background: form.processType===opt?"#e6f4f2":"#f5f5f5",
                        border:`1.5px solid ${form.processType===opt?TEAL:"#e0e0e0"}`,
                        borderRadius:10, padding:"8px 14px", transition:"all 0.15s", flex:1, justifyContent:"center" }}>
                        <input type="radio" name="processType" value={opt} checked={form.processType===opt} onChange={()=>set("processType",opt)} style={{ display:"none" }}/>
                        {form.processType===opt && <Check size={13} color={TEAL} strokeWidth={3}/>}
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hito 商品推廣 */}
          <div style={{ marginBottom:14, border:"1.5px solid #e8d5a3", borderRadius:12, padding:"16px 16px 14px", background:"#fffdf4" }}>
            <div style={{ fontSize:13, fontWeight:800, color:"#7c5a00", marginBottom:4, letterSpacing:"0.04em" }}>⭐ Hito 商品推廣</div>
            <div style={{ fontSize:11, color:"#b08030", marginBottom:14 }}>可上傳最多 4 張商品圖片，搭配商品簡介一同展示</div>

            {/* 圖片格子 */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:12 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ position:"relative", aspectRatio:"1", borderRadius:8, overflow:"hidden", border:`1.5px dashed ${hitoImages[i]?"#e8d5a3":"#ddd"}`, background: hitoImages[i]?"#000":"#fafafa", cursor: hitoImages[i]?"default":"pointer" }}
                  onClick={()=>!hitoImages[i] && hitoFileRef.current?.click()}>
                  {hitoImages[i]
                    ? <>
                        <img src={hitoImages[i]} alt={`hito-${i}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        <button onClick={e=>{ e.stopPropagation(); removeHitoImg(i); }}
                          style={{ position:"absolute", top:3, right:3, background:"rgba(0,0,0,0.55)", border:"none", borderRadius:"50%", width:20, height:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <X size={11} color="#fff"/>
                        </button>
                      </>
                    : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:4 }}>
                        <Upload size={16} color="#ccc"/>
                        <span style={{ fontSize:10, color:"#ccc" }}>{i+1}</span>
                      </div>
                  }
                </div>
              ))}
            </div>
            {hitoImages.length < 4 && (
              <button onClick={()=>hitoFileRef.current?.click()}
                style={{ fontSize:12, color:"#7c5a00", background:"#fef3c7", border:"1px solid #e8d5a3", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontFamily:"inherit", fontWeight:600, marginBottom:12 }}>
                + 新增圖片（{hitoImages.length}/4）
              </button>
            )}
            <input ref={hitoFileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={handleHitoFiles}/>

            {/* 商品簡介 */}
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#7c5a00", display:"block", marginBottom:5 }}>商品簡介</label>
              <textarea value={form.hitoDesc} onChange={e=>set("hitoDesc",e.target.value)}
                placeholder="介紹此次推廣的明星商品特色、材質、使用方式…"
                style={{ width:"100%", border:"1px solid #e8d5a3", borderRadius:10, padding:"10px 13px", fontSize:14, fontFamily:"inherit", color:INK, resize:"vertical", minHeight:80, lineHeight:1.65, background:"#fff" }}/>
            </div>
          </div>

          {/* 官方網站 / 電商網站（最後） */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 14px" }}>
            <div style={{ gridColumn:"1/-1" }}><Field label="官方網站" k="url" placeholder="https://www.example.com" type="url"/></div>
            <div style={{ gridColumn:"1/-1" }}><Field label="電商網站" k="ecomUrl" placeholder="https://shop.example.com" type="url"/></div>
          </div>

          {/* Buttons */}
          <div style={{ display:"flex", gap:10, marginTop:22, paddingTop:18, borderTop:"1px solid #f0f0f0" }}>
            <button onClick={onClose} style={{ flex:1, background:"#f5f5f5", color:"#555", border:"none", borderRadius:12, padding:"12px 0", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>取消</button>
            <button onClick={handleSave} style={{ flex:2, background:TEAL, color:"#fff", border:"none", borderRadius:12, padding:"12px 0", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              <Save size={15}/> 儲存變更
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function AdminToggle({ adminMode, onToggle }) {
  return (
    <button onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", background: adminMode?AMBER_LIGHT:"#f0f0ef", border:`1.5px solid ${adminMode?AMBER:"#e0e0e0"}`, borderRadius:20, cursor:"pointer", fontFamily:"inherit", transition:"all 0.25s" }}>
      <ShieldCheck size={15} color={adminMode?AMBER:"#888"}/>
      <span style={{ fontSize:13, fontWeight:700, color:adminMode?AMBER:"#666", letterSpacing:"0.04em", whiteSpace:"nowrap" }}>
        {adminMode?"管理員模式 · 開":"管理員模式"}
      </span>
      <div style={{ width:32, height:18, background:adminMode?AMBER:"#ddd", borderRadius:9, position:"relative", transition:"background 0.25s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:2, left:adminMode?16:2, width:14, height:14, background:"#fff", borderRadius:"50%", transition:"left 0.25s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
      </div>
    </button>
  );
}

function ShopDetail({ shop, onClose, onEdit, adminMode }) {
  const hasImg = !!shop.image;
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", animation:"fadeIn 0.2s ease" }}>
      <div style={{ background:"#fafaf9", borderRadius:24, width:"100%", maxWidth:680, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 40px 100px rgba(0,0,0,0.25)", animation:"popIn 0.25s cubic-bezier(.34,1.56,.64,1)", position:"relative" }}>

        {/* 封面圖 */}
        <div style={{ height:220, background:hasImg?"#111":shop.color, position:"relative", borderRadius:"24px 24px 0 0", overflow:"hidden", flexShrink:0 }}>
          {hasImg
            ? <img src={shop.image} alt={shop.name} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.9 }}/>
            : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", fontFamily:"serif", fontSize:100, fontWeight:900, color:"rgba(26,26,26,0.06)", userSelect:"none" }}>{shop.name[0]}</div>
          }
          {/* 關閉 */}
          <button onClick={onClose}
            style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,0.9)", border:"none", borderRadius:12, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
            <X size={16}/>
          </button>
          {/* MIT / 加工標籤 */}
          <div style={{ position:"absolute", top:14, left:14 }}>
            {shop.mitTaiwan !== false
              ? <MITBadge/>
              : <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"#fff3cd", color:"#856404", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:4, border:"1px solid #ffc107" }}>🏷 {shop.processType||"臺灣加工"}</span>
            }
          </div>
          {/* 分類標籤 */}
          <div style={{ position:"absolute", bottom:14, left:14, background:"rgba(255,255,255,0.88)", backdropFilter:"blur(8px)", borderRadius:8, padding:"4px 12px", fontSize:12, fontWeight:700, color:INK }}>
            {CAT_EMOJI[shop.cat]} {shop.cat}
          </div>
          {/* 管理員編輯按鈕 */}
          {adminMode && (
            <button onClick={()=>{ onClose(); onEdit(shop); }}
              style={{ position:"absolute", bottom:14, right:14, background:AMBER, color:"#fff", border:"none", borderRadius:20, padding:"6px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
              <Pencil size={12}/> 編輯
            </button>
          )}
        </div>

        {/* 內容 */}
        <div style={{ padding:"28px 32px 32px" }}>
          {/* 標題 */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:26, fontWeight:900, color:INK, letterSpacing:"-0.01em", lineHeight:1.15 }}>{shop.name}</div>
            {shop.en && <div style={{ fontSize:12, color:"#aaa", fontWeight:500, letterSpacing:"0.12em", marginTop:4 }}>{shop.en}</div>}
            {shop.tag && <span style={{ display:"inline-block", marginTop:10, fontSize:12, fontWeight:600, background:TEAL_LIGHT, color:TEAL, borderRadius:20, padding:"4px 12px", border:`1px solid #9fd3c7` }}>{shop.tag}</span>}
          </div>

          {/* 簡介 */}
          {shop.desc && <p style={{ fontSize:15, color:"#444", lineHeight:1.8, marginBottom:24, paddingBottom:24, borderBottom:"1px solid #f0f0f0" }}>{shop.desc}</p>}

          {/* 資訊列 */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            {shop.hasPhysicalStore === false
              ? <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, fontWeight:600, color:"#0369a1", background:"#eff6ff", borderRadius:10, padding:"8px 14px", alignSelf:"flex-start" }}>🛒 純線上銷售</div>
              : <>
                  {(shop.loc || shop.address) && (
                    <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                      <MapPin size={16} color={TEAL} style={{flexShrink:0, marginTop:2}}/>
                      <span style={{ fontSize:14, color:"#555" }}>{shop.loc}{shop.address ? `　${shop.address}` : ""}</span>
                    </div>
                  )}
                  {shop.phone && (
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Phone size={16} color={TEAL}/>
                      <a href={`tel:${shop.phone}`} style={{ fontSize:14, color:"#555", textDecoration:"none" }}>{shop.phone}</a>
                    </div>
                  )}
                </>
            }

            {/* 原料資訊 */}
            {shop.mitTaiwan === false && (shop.rawMaterial || shop.originCountry) && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
                {shop.rawMaterial && <span style={{ background:"#f3f4f6", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:600, color:"#555" }}>原料：{shop.rawMaterial}</span>}
                {shop.originCountry && <span style={{ background:"#f3f4f6", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:600, color:"#555" }}>產地：{shop.originCountry}</span>}
                {shop.processType && <span style={{ background:"#f3f4f6", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:600, color:"#555" }}>{shop.processType}</span>}
              </div>
            )}

            {/* 服務項目 */}
            {shop.cat === "職人師傅" && shop.services?.length > 0 && (
              <div>
                <div style={{ fontSize:12, color:"#999", fontWeight:600, marginBottom:8, letterSpacing:"0.06em" }}>服務項目</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {shop.services.map(s=>(
                    <span key={s} style={{ fontSize:12, fontWeight:600, background:TEAL_LIGHT, color:TEAL, borderRadius:20, padding:"4px 12px", border:`1px solid #9fd3c7` }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 連結按鈕 */}
          {(shop.url || shop.ecomUrl) && (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:24 }}>
              {shop.url && (
                <button onClick={()=>window.open(shop.url,"_blank")}
                  style={{ flex:1, background:TEAL, color:"#fff", border:"none", borderRadius:12, padding:"12px 20px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                  <ExternalLink size={14}/> 官方網站
                </button>
              )}
              {shop.ecomUrl && (
                <button onClick={()=>window.open(shop.ecomUrl,"_blank")}
                  style={{ flex:1, background:"#0369a1", color:"#fff", border:"none", borderRadius:12, padding:"12px 20px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                  <ExternalLink size={14}/> 電商網站
                </button>
              )}
            </div>
          )}

          {/* Hito 推廣 */}
          {(shop.hitoImages?.length > 0 || shop.hitoDesc) && (
            <div style={{ background:"#fffdf4", border:"1.5px solid #e8d5a3", borderRadius:14, padding:"18px 20px" }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#7c5a00", letterSpacing:"0.08em", marginBottom:12 }}>⭐ HITO 商品推廣</div>
              {shop.hitoImages?.length > 0 && (
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(shop.hitoImages.length,4)},1fr)`, gap:8, marginBottom: shop.hitoDesc?12:0 }}>
                  {shop.hitoImages.map((img,i)=>(
                    <div key={i} style={{ borderRadius:10, overflow:"hidden", aspectRatio:"1" }}>
                      <img src={img} alt={`hito-${i}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                  ))}
                </div>
              )}
              {shop.hitoDesc && <p style={{ fontSize:13, color:"#5a3e00", lineHeight:1.7, margin:0 }}>{shop.hitoDesc}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopCard({ shop, idx, adminMode, onEdit, onView }) {
  const [hovered, setHovered] = useState(false);
  const hasImg = !!shop.image;
  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      onClick={()=>!adminMode && onView(shop)}
      style={{
        background:"#fff",
        border:`1px solid ${hovered?(adminMode?AMBER:TEAL):"#e5e5e5"}`,
        borderRadius:16, overflow:"hidden",
        cursor: adminMode?"default":"pointer",
        transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered?"translateY(-4px)":"none",
        boxShadow: hovered?`0 20px 40px ${adminMode?"rgba(180,83,9,0.1)":"rgba(10,124,110,0.12)"}`:"0 2px 8px rgba(0,0,0,0.05)",
        animationDelay:`${idx*0.07}s`,
        position:"relative",
      }}
      className="card-animate"
    >
      {adminMode && (
        <button onClick={e=>{ e.stopPropagation(); onEdit(shop); }}
          style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", zIndex:10, background:AMBER, color:"#fff", border:"none", borderRadius:20, padding:"6px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 14px rgba(180,83,9,0.35)", whiteSpace:"nowrap" }}>
          <Pencil size={12}/> 編輯此店家
        </button>
      )}

      <div style={{ background:hasImg?"#111":shop.color, height:140, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
        {hasImg
          ? <img src={shop.image} alt={shop.name} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.9 }}/>
          : <div style={{ fontFamily:"serif", fontSize:52, fontWeight:900, color:"rgba(26,26,26,0.07)", letterSpacing:"-0.04em", userSelect:"none", lineHeight:1 }}>{shop.name[0]}</div>
        }
        <div style={{ position:"absolute", top:12, left:12 }}>
          {shop.mitTaiwan !== false
            ? <MITBadge/>
            : <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"#fff3cd", color:"#856404", fontSize:10, fontWeight:700, letterSpacing:"0.06em", padding:"3px 8px", borderRadius:4, border:"1px solid #ffc107" }}>
                🏷 {shop.processType || "臺灣加工"}
              </span>
          }
        </div>
        <div style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.88)", backdropFilter:"blur(8px)", borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:600, color:INK, letterSpacing:"0.04em", display:"flex", alignItems:"center", gap:4 }}>
          {shop.tag}{shop.url && <ExternalLink size={10} color={TEAL}/>}
        </div>
      </div>

      <div style={{ padding:"20px 20px 18px" }}>
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:16, fontWeight:800, color:INK, letterSpacing:"0.01em", lineHeight:1.2 }}>{shop.name}</div>
          <div style={{ fontSize:10, color:"#888", fontWeight:500, letterSpacing:"0.12em", marginTop:2 }}>{shop.en}</div>
        </div>
        <p style={{ fontSize:13, color:"#555", lineHeight:1.65, marginBottom:14, minHeight:42 }}>{shop.desc}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:7, borderTop:"1px solid #f0f0f0", paddingTop:12 }}>
          {shop.loc && shop.hasPhysicalStore !== false && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:6, fontSize:12, color:"#777" }}>
              <MapPin size={13} color={TEAL} style={{flexShrink:0, marginTop:1}}/><span>{shop.loc}{shop.address ? `　${shop.address}` : ""}</span>
            </div>
          )}
          {shop.phone && shop.hasPhysicalStore !== false && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#777" }}>
              <Phone size={13} color={TEAL}/><span>{shop.phone}</span>
            </div>
          )}
          {shop.hasPhysicalStore === false && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, color:"#0369a1", background:"#eff6ff", borderRadius:8, padding:"4px 10px" }}>
              🛒 純線上銷售
            </div>
          )}
          {shop.url && (
            <div onClick={e=>{ e.stopPropagation(); window.open(shop.url,"_blank"); }}
              style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, color:TEAL, fontWeight:600, cursor:"pointer" }}>
              <ExternalLink size={12}/><span>官方網站</span>
            </div>
          )}
          {shop.ecomUrl && (
            <div onClick={e=>{ e.stopPropagation(); window.open(shop.ecomUrl,"_blank"); }}
              style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, color:"#0369a1", fontWeight:600, cursor:"pointer" }}>
              <ExternalLink size={12}/><span>電商網站</span>
            </div>
          )}
          {shop.cat === "職人師傅" && shop.services?.length > 0 && (
            <div style={{ marginTop:4 }}>
              <div style={{ fontSize:11, color:"#888", fontWeight:600, marginBottom:5, letterSpacing:"0.04em" }}>服務項目</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {shop.services.map(s=>(
                  <span key={s} style={{ fontSize:11, fontWeight:600, background:TEAL_LIGHT, color:TEAL, borderRadius:20, padding:"3px 10px", border:`1px solid #9fd3c7` }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {shop.mitTaiwan === false && (shop.rawMaterial || shop.originCountry) && (
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:5, fontSize:11, color:"#888", marginTop:2 }}>
              {shop.rawMaterial && <span style={{ background:"#f3f4f6", borderRadius:4, padding:"2px 7px", fontWeight:600 }}>原料：{shop.rawMaterial}</span>}
              {shop.originCountry && <span style={{ background:"#f3f4f6", borderRadius:4, padding:"2px 7px", fontWeight:600 }}>產地：{shop.originCountry}</span>}
              {shop.processType && <span style={{ background:"#f3f4f6", borderRadius:4, padding:"2px 7px", fontWeight:600 }}>{shop.processType}</span>}
            </div>
          )}
        </div>

        {/* Hito 商品推廣 */}
        {(shop.hitoImages?.length > 0 || shop.hitoDesc) && (
          <div style={{ borderTop:"1px solid #f5f0e0", background:"#fffdf4", padding:"14px 20px 16px" }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#7c5a00", letterSpacing:"0.08em", marginBottom:10 }}>⭐ HITO 商品推廣</div>
            {shop.hitoImages?.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${shop.hitoImages.length},1fr)`, gap:6, marginBottom: shop.hitoDesc ? 10 : 0 }}>
                {shop.hitoImages.map((img,i)=>(
                  <div key={i} style={{ borderRadius:8, overflow:"hidden", aspectRatio:"1", background:"#eee" }}>
                    <img src={img} alt={`hito-${i}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  </div>
                ))}
              </div>
            )}
            {shop.hitoDesc && <p style={{ fontSize:12, color:"#5a3e00", lineHeight:1.65, margin:0 }}>{shop.hitoDesc}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCaCayYaeTDcxhTEOYgdMOqbsWvVMURegw",
  authDomain: "taizy01.firebaseapp.com",
  projectId: "taizy01",
  storageBucket: "taizy01.firebasestorage.app",
  messagingSenderId: "738740540200",
  appId: "1:738740540200:web:50137063814e22db6e761d"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const SHOPS_DOC = doc(db, "taizy", "shops");

async function loadShopsFromDB() {
  try {
    const snap = await getDoc(SHOPS_DOC);
    if (snap.exists()) return snap.data().list;
  } catch(e) { console.error("Firebase 讀取失敗", e); }
  return DEFAULT_SHOPS;
}

async function saveShopsToDB(shops) {
  try {
    await setDoc(SHOPS_DOC, { list: shops });
  } catch(e) { console.error("Firebase 儲存失敗", e); }
}

const ADMIN_PWD = "20260512";

export default function TAIZY() {
  const [shops, setShops] = useState(DEFAULT_SHOPS);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("全部");
  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [viewingShop, setViewingShop] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdInput, setPwdInput] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  useEffect(() => {
    loadShopsFromDB().then(data => { setShops(data); setLoading(false); });
  }, []);

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 1500);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      if (adminMode) { setAdminMode(false); showToast("已退出管理員模式"); }
      else { setShowPwdModal(true); setPwdInput(""); setPwdError(false); }
    }
  };

  const handlePwdSubmit = () => {
    if (pwdInput === ADMIN_PWD) {
      setAdminMode(true); setShowPwdModal(false);
      showToast("✅ 管理員模式已開啟");
    } else {
      setPwdError(true); setPwdInput("");
    }
  };

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const filtered = shops.filter(s => {
    const matchCat = activeCat === "全部" || s.cat === activeCat;
    const q = searchVal.toLowerCase();
    return matchCat && (!q || s.name.includes(q) || s.tag.includes(q) || s.loc.includes(q) || s.desc.includes(q));
  });

  const handleSave = async (updated) => {
    const next = shops.map(s => s.id === updated.id ? updated : s);
    setShops(next);
    await saveShopsToDB(next);
    setEditingShop(null);
    showToast("✅ 已儲存！所有人立刻看到更新");
  };

  const handleReset = async () => {
    if (!confirm("確定要還原所有店家資料至預設值嗎？")) return;
    setShops(DEFAULT_SHOPS);
    await saveShopsToDB(DEFAULT_SHOPS);
    showToast("♻️ 已還原預設資料", "warn");
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16, fontFamily:"'Noto Sans TC',sans-serif" }}>
      <div style={{ width:40, height:40, border:`3px solid ${TEAL_LIGHT}`, borderTopColor:TEAL, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <div style={{ fontSize:14, color:"#999" }}>載入資料中…</div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Noto Sans TC','PingFang TC','Helvetica Neue',sans-serif", background:"#fafaf9", minHeight:"100vh", color:INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes popIn  { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .card-animate { animation:fadeUp 0.5s ease both; }
        .nav-link { font-size:14px;font-weight:600;letter-spacing:0.08em;color:#444;cursor:pointer;padding:6px 0;border-bottom:2px solid transparent;transition:all 0.2s; }
        .nav-link:hover { color:${TEAL};border-bottom-color:${TEAL}; }
        .filter-btn { border:1px solid #e0e0e0;border-radius:30px;padding:8px 20px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;background:#fff;color:#666;letter-spacing:0.06em;font-family:inherit; }
        .filter-btn:hover { border-color:${TEAL};color:${TEAL}; }
        .filter-btn.active { background:${TEAL};color:#fff;border-color:${TEAL}; }
        input::placeholder,textarea::placeholder { color:#aaa; }
        input:focus,textarea:focus { outline:none;border-color:${TEAL} !important;box-shadow:0 0 0 3px rgba(10,124,110,0.1) !important; }
        *{ box-sizing:border-box; }
      `}</style>

      {/* 密碼彈窗 */}
      {showPwdModal && (
        <div onClick={e=>{ if(e.target===e.currentTarget){ setShowPwdModal(false); } }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:20, padding:"32px 28px", width:320, boxShadow:"0 32px 80px rgba(0,0,0,0.2)", animation:"popIn 0.2s cubic-bezier(.34,1.56,.64,1)" }}>
            <div style={{ fontSize:28, textAlign:"center", marginBottom:8 }}>🔐</div>
            <div style={{ fontSize:17, fontWeight:800, color:INK, textAlign:"center", marginBottom:4 }}>管理員驗證</div>
            <div style={{ fontSize:13, color:"#999", textAlign:"center", marginBottom:24 }}>請輸入管理員密碼</div>
            <input
              type="password"
              value={pwdInput}
              onChange={e=>{ setPwdInput(e.target.value); setPwdError(false); }}
              onKeyDown={e=>e.key==="Enter" && handlePwdSubmit()}
              placeholder="輸入密碼…"
              autoFocus
              style={{ width:"100%", border:`1.5px solid ${pwdError?"#e74c3c":TEAL}`, borderRadius:12, padding:"12px 16px", fontSize:16, fontFamily:"inherit", color:INK, textAlign:"center", letterSpacing:"0.2em", marginBottom:8 }}/>
            {pwdError && <div style={{ fontSize:12, color:"#e74c3c", textAlign:"center", marginBottom:8 }}>密碼錯誤，請再試一次</div>}
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button onClick={()=>setShowPwdModal(false)}
                style={{ flex:1, background:"#f5f5f5", color:"#555", border:"none", borderRadius:12, padding:"11px 0", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>取消</button>
              <button onClick={handlePwdSubmit}
                style={{ flex:2, background:TEAL, color:"#fff", border:"none", borderRadius:12, padding:"11px 0", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>確認登入</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:600, background: toast.type==="warn"?AMBER:TEAL, color:"#fff", padding:"12px 24px", borderRadius:30, fontSize:14, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.18)", whiteSpace:"nowrap", animation:"fadeIn 0.2s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Admin Banner */}
      {adminMode && (
        <div style={{ background:AMBER, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:16, padding:"9px 24px", fontSize:13, fontWeight:700, letterSpacing:"0.05em" }}>
          <span>✏️ 管理員模式開啟中 — 點擊各卡片上方的「編輯此店家」即可修改（資料自動儲存）</span>
          <button onClick={handleReset} style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.4)", color:"#fff", borderRadius:14, padding:"3px 12px", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>還原預設</button>
          <button onClick={()=>{ setAdminMode(false); showToast("已退出管理員模式"); }} style={{ background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", borderRadius:14, padding:"3px 12px", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>退出管理員</button>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:scrolled?"rgba(250,250,249,0.92)":"transparent", backdropFilter:scrolled?"blur(20px)":"none", borderBottom:scrolled?"1px solid rgba(0,0,0,0.08)":"1px solid transparent", transition:"all 0.35s", padding:"0 max(24px,5vw)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", flexShrink:0 }} onClick={handleLogoClick}>
            <div style={{ width:36, height:36, background:INK, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontSize:14, fontWeight:900 }}>臺</span>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:900, letterSpacing:"0.12em", color:INK, lineHeight:1 }}>TAIZY</div>
              <div style={{ fontSize:9, color:TEAL, fontWeight:700, letterSpacing:"0.18em", marginTop:1 }}>臺製集</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            {NAV_CATS.map(c=>(
              <span key={c} className="nav-link" onClick={()=>{ setActiveCat(c); document.getElementById("showcase")?.scrollIntoView({behavior:"smooth"}); }}>
                {CAT_EMOJI[c]} {c}
              </span>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f0f0ef", borderRadius:30, padding:"8px 16px" }}>
              <Search size={14} color="#666"/>
              <input style={{ border:"none", background:"transparent", fontSize:13, width:100, color:INK, fontFamily:"inherit" }} placeholder="搜尋…" value={searchVal} onChange={e=>setSearchVal(e.target.value)}/>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:INK, padding:"120px max(24px,5vw) 100px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, right:0, width:"40%", height:"100%", opacity:0.04, pointerEvents:"none" }}>
          {[...Array(12)].map((_,i)=><div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${i*8.5}%`, width:1, background:"#fff" }}/>)}
        </div>
        <div style={{ position:"absolute", bottom:-1, left:0, right:0, height:60, background:"#fafaf9", borderRadius:"50% 50% 0 0 / 60px 60px 0 0" }}/>
        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", animation:"fadeIn 0.8s ease" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, border:"1px solid rgba(255,255,255,0.15)", borderRadius:30, padding:"6px 16px", marginBottom:36 }}>
            <span style={{ width:6, height:6, background:TEAL, borderRadius:"50%", display:"inline-block" }}/>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)", letterSpacing:"0.14em", fontWeight:600 }}>MADE IN TAIWAN · 台灣製造</span>
          </div>
          <h1 style={{ fontSize:"clamp(42px,7vw,88px)", fontWeight:900, color:"#fff", lineHeight:1.05, letterSpacing:"-0.02em", marginBottom:24, maxWidth:700 }}>
            正港本領，<br/><span style={{ color:TEAL }}>臺製集結</span>。
          </h1>
          <p style={{ fontSize:"clamp(15px,1.8vw,18px)", color:"rgba(255,255,255,0.55)", maxWidth:480, lineHeight:1.75, marginBottom:48 }}>
            收集台灣各地優秀職人工藝與在地品牌，每一件商品都是驕傲的台灣製造。
          </p>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <button onClick={()=>document.getElementById("showcase")?.scrollIntoView({behavior:"smooth"})}
              style={{ background:TEAL, color:"#fff", border:"none", borderRadius:30, padding:"14px 32px", fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, letterSpacing:"0.04em", fontFamily:"inherit" }}>
              探索台製好店 <ArrowRight size={16}/>
            </button>
            <button style={{ background:"transparent", color:"rgba(255,255,255,0.7)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:30, padding:"14px 32px", fontSize:15, fontWeight:600, cursor:"pointer", letterSpacing:"0.04em", fontFamily:"inherit" }}>
              了解 MIT 認證
            </button>
          </div>
          <div style={{ display:"flex", gap:48, marginTop:72, paddingTop:40, borderTop:"1px solid rgba(255,255,255,0.08)", flexWrap:"wrap" }}>
            {[
              [shops.length.toLocaleString(), "進駐品牌"],
              [NAV_CATS.length.toString(), "產業分類"],
              [[...new Set(shops.map(s=>s.loc).filter(Boolean))].length.toString(), "縣市覆蓋"],
              [shops.filter(s=>s.mitTaiwan!==false).length.toString(), "真．MIT 臺灣製造"],
              [shops.filter(s=>s.mitTaiwan===false).length.toString(), "臺灣加工與分裝"],
            ].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontSize:"clamp(24px,3vw,32px)", fontWeight:900, color:"#fff", letterSpacing:"-0.02em" }}>{n}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4, letterSpacing:"0.1em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH & FILTER */}
      <section id="showcase" style={{ padding:"72px max(24px,5vw) 0" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16 }}>
              <div>
                <div style={{ fontSize:11, color:TEAL, fontWeight:700, letterSpacing:"0.18em", marginBottom:8 }}>SHOP SHOWCASE</div>
                <h2 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, color:INK, letterSpacing:"-0.02em", lineHeight:1.1 }}>台灣職人精選</h2>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #e5e5e5", borderRadius:30, padding:"10px 18px" }}>
                <Search size={15} color="#888"/>
                <input style={{ border:"none", background:"transparent", fontSize:14, color:INK, width:200, fontFamily:"inherit" }} placeholder="搜尋商家、地區、標籤…" value={searchVal} onChange={e=>setSearchVal(e.target.value)}/>
                {searchVal && <X size={14} color="#aaa" style={{cursor:"pointer"}} onClick={()=>setSearchVal("")}/>}
              </div>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <Filter size={14} color="#888"/>
              {FILTERS.map(f=>(
                <button key={f} className={`filter-btn${activeCat===f?" active":""}`} onClick={()=>setActiveCat(f)}>
                  {CAT_EMOJI[f] ? `${CAT_EMOJI[f]} ${f}` : f}
                </button>
              ))}
              <span style={{ marginLeft:"auto", fontSize:13, color:"#999" }}>共 <strong style={{color:INK}}>{filtered.length}</strong> 家商店</span>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP CARDS */}
      <section style={{ padding:"40px max(24px,5vw) 80px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          {filtered.length === 0
            ? <div style={{ textAlign:"center", padding:"80px 0", color:"#aaa" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
                <div style={{ fontSize:18, fontWeight:600, color:"#888", marginBottom:8 }}>找不到相關商家</div>
                <div style={{ fontSize:14 }}>請嘗試其他關鍵字或分類</div>
              </div>
            : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24 }}>
                {filtered.map((s,i)=>(
                  <ShopCard key={s.id} shop={s} idx={i} adminMode={adminMode} onEdit={setEditingShop} onView={setViewingShop}/>
                ))}
              </div>
          }
          {filtered.length > 0 && (
            <div style={{ textAlign:"center", marginTop:56 }}>
              <button style={{ background:"transparent", color:INK, border:"1.5px solid #e0e0e0", borderRadius:30, padding:"14px 40px", fontSize:14, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, letterSpacing:"0.06em", fontFamily:"inherit" }}>
                載入更多台製商家 <ChevronRight size={16}/>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* MIT BANNER */}
      <section style={{ background:TEAL_LIGHT, padding:"64px max(24px,5vw)", borderTop:"1px solid rgba(10,124,110,0.12)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:32 }}>
          <div>
            <div style={{ fontSize:11, color:TEAL, fontWeight:700, letterSpacing:"0.18em", marginBottom:12 }}>MIT CERTIFICATION</div>
            <h3 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:900, color:INK, lineHeight:1.2, letterSpacing:"-0.01em" }}>每一件商品<br/>都有故事可說</h3>
          </div>
          <div style={{ maxWidth:480 }}>
            <p style={{ fontSize:15, color:"#444", lineHeight:1.8, marginBottom:24 }}>TAIZY 臺製集努力審核每一個品牌中，希望可以讓更多品牌被看見，臺灣製造是我們的驕傲。</p>
            <button style={{ background:INK, color:"#fff", border:"none", borderRadius:30, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, fontFamily:"inherit" }}>
              申請進駐 <ArrowRight size={15}/>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:INK, padding:"56px max(24px,5vw) 40px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:40, paddingBottom:40, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:36, height:36, background:"#fff", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:INK, fontSize:14, fontWeight:900 }}>臺</span>
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:900, letterSpacing:"0.12em", color:"#fff" }}>TAIZY</div>
                  <div style={{ fontSize:9, color:TEAL, fontWeight:700, letterSpacing:"0.18em" }}>臺製集</div>
                </div>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", maxWidth:240, lineHeight:1.7 }}>台派玩家專屬，挺台灣沒理由。</p>
            </div>
            {[
              { title:"探索", links:["食品飲料","服飾配件","家居生活","交通出行","教育文創","休閒娛樂"] },
              { title:"關於", links:["品牌理念","MIT 認證","商家入駐","聯絡我們"] },
              { title:"服務", links:["使用條款","隱私政策","常見問題","客服中心"] },
            ].map(col=>(
              <div key={col.title}>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:"0.14em", marginBottom:16 }}>{col.title}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {col.links.map(l=>(
                    <span key={l} style={{ fontSize:13, color:"rgba(255,255,255,0.35)", cursor:"pointer", transition:"color 0.2s" }}
                      onMouseEnter={e=>e.target.style.color="rgba(255,255,255,0.8)"}
                      onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.35)"}
                    >{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ paddingTop:32, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)", letterSpacing:"0.06em" }}>© 2026 TAIZY 臺製集 · 台灣製造，驕傲出品</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.2)", letterSpacing:"0.04em" }}>MADE IN TAIWAN 🇹🇼</span>
          </div>
        </div>
      </footer>

      {viewingShop && <ShopDetail shop={viewingShop} onClose={()=>setViewingShop(null)} onEdit={setEditingShop} adminMode={adminMode}/>}
      {editingShop && <EditModal shop={editingShop} onSave={handleSave} onClose={()=>setEditingShop(null)}/>}
    </div>
  );
}
