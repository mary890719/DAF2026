window.DAF_DATA = {
  assets: {
    hero: "assets/images/hero/daf2026-key-visual.jpg"
  },
  social: {
    instagram: {
      url: "https://www.instagram.com/daf_taipei/",
      handle: "@daf_taipei",
      label: "Instagram"
    },
    facebook: {
      url: "https://www.facebook.com/DigitalArtFestivalTaipei/?locale=zh_TW",
      name: "臺北數位藝術節",
      label: "Facebook"
    }
  },
  works: Array.from({length: 20}, (_, i) => ({
    id: i + 1, number: String(i + 1).padStart(2, "0"), title: `作品名稱${i + 1}`,
    year: "2026", medium: "複合媒材", dimensions: "尺寸待定", location: "臺北植物園",
    description: "作品介紹文字預留。作品透過數位媒材與環境之間的關係，回應「灰色自動體」的策展主題。",
    images: Array.from({length: 4}, (_, imageIndex) => ({
      id: `${i + 1}-${imageIndex + 1}`,
      src: "",
      alt: `作品名稱${i + 1} 圖片 ${imageIndex + 1}`
    })),
    creators: [{name: i % 4 === 0 ? "藝術團隊名稱" : `藝術家${(i % 8) + 1}`, bio: "藝術家／創作團隊介紹文字預留，實際內容將由後台資料提供。"}]
  })),
  mapMarkers: [
    {workId: 1, x: 57, y: 38},
    {workId: 2, x: 45, y: 67},
    {workId: 3, x: 27, y: 31},
    {workId: 4, x: 69, y: 60},
    {workId: 5, x: 39, y: 48}
  ],
  soundArtists: Array.from({length: 4}, (_, i) => ({id: i + 1, name: `聲響藝術家${i + 1}`})),
  news: Array.from({length: 5}, (_, i) => ({id: i + 1, date: `2026.09.${String(20-i).padStart(2,"0")}`, title: i === 0 ? "「2026 臺北數位藝術節」將於 10.31-11.15 展開序幕！" : `最新消息標題${i + 1}`, body: "詳細資訊內文。此處為第一版 Prototype 的內容預留，後續將由 WordPress 後台管理。"})),
  events: [
    {label:"展覽時間", detail:"2026.10.31–11.15"}, {label:"開放時間", detail:"09:00–17:00（週一休館）"},
    {label:"導覽時間", detail:"（待定）"}, {label:"藝術家講座 I", detail:"（待定）"}, {label:"藝術家講座 II", detail:"（待定）"}, {label:"其他活動", detail:"（待定）"}
  ],
  organizations: [
    {type:"主辦單位", names:["臺北市文化局"]}, {type:"協辦單位", names:["文創技研有限公司"]},
    {type:"場地合作", names:["臺北典藏植物園"]}, {type:"合作單位", names:["臺灣當代文化實驗場", "噪流"]},
    {type:"贊助", names:["C2x3", "十銓科技"], sponsor:true}
  ]
};
